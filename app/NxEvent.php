<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

use App\User;
use App\AttendeesGroup;
use App\StudentLevel;

class NxEvent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'activityPoints',
        'eventStartDateTime',
        'eventEndDateTime',
        'minCapacity',
        'maxCapacity',
        'mandatoryParticipation',
        'eventType',
        'feedbackLink',
        'status',
    ];

    protected $dateFormat = 'Y-m-d H:i:s';
    protected $dates = ['deleted_at', 'eventEndDateTime', 'eventStartDateTime'];

    public static function createNew($attributes = [])
    {
        $event = new NxEvent($attributes);
        $event->ownerId = \Auth::user()->id;
        $event->shortDescription = clean($attributes['shortDescription']);
        $event->description = clean($attributes['description']);
        $event->hostId = User::findOrFail($attributes['hostId'])->id;
        $event->nxLocationId = NxLocation::findOrFail($attributes['nxLocationId'])->id;
        $event->emailTagBase = \Uuid::generate(4);
        $event->save();

        foreach ($attributes['attendeesGroups'] as $group) {
            $event->attendeesGroups()->save(AttendeesGroup::createNew($group));
        }

        foreach ($attributes['lectors'] as $lector) {
            $event->lectors()->save(User::findOrFail($lector));
        }

        if (isset($attributes['curriculumLevelId'])) {
            $curriculumLevel = StudentLevel::findOrFail($attributes['curriculumLevelId']);
            $event->curriculumLevelId = $curriculumLevel->id;
        }

        if (isset($attributes['groupedEvents'])) {
            foreach ($attributes['groupedEvents'] as $eventId) {
                $event->groupedEvents()->save(NxEvent::findOrFail($eventId));
            }
        }

        if (isset($attributes['exclusionaryEvents'])) {
            foreach ($attributes['exclusionaryEvents'] as $eventId) {
                $event->exclusionaryEvents()->save(NxEvent::findOrFail($eventId));
            }
        }

        if (isset($attributes['feedbackLink'])) {
            $response = \FeedbackForms::validate($attributes['feedbackLink']);

            if ($response['code'] != 200) {
                return response()->json([
                  'code' => 500,
                  'error' => $response['error'],
                ]);
            }

            $event->publicFeedbackLink = $response['publicResponseUrl'];
        }

        if (isset($attributes['semester']) && $attributes['semester']) {
            $semester = \App\Semester::findOrFail($attributes['semester']);
            $event->semesterId = $semester->id;
        }

        $event->save();

        return $event;
    }

    public function updateData($attributes)
    {
        $this->fill($attributes);

        $this->ownerId = \Auth::user()->id;

        if (isset($attributes['shortDescription'])) {
            $this->shortDescription = clean($attributes['shortDescription']);
        }

        if (isset($attributes['description'])) {
            $this->description = clean($attributes['description']);
        }

        if (isset($attributes['hostId'])) {
            $this->hostId = User::findOrFail($attributes['hostId'])->id;
        }

        if (isset($attributes['nxLocationId'])) {
            $this->nxLocationId = NxLocation::findOrFail($attributes['nxLocationId'])->id;
        }

        if (isset($attributes['curriculumLevelId'])) {
            $curriculumLevel = StudentLevel::findOrFail($attributes['curriculumLevelId']);
            $this->curriculumLevelId = $curriculumLevel->id;
        }

        if (isset($attributes['groupedEvents'])) {
            $this->groupedEvents()->sync(NxEvent::whereIn('id', $attributes['groupedEvents'])->pluck('id')->toArray());
        }

        if (isset($attributes['exclusionaryEvents'])) {
            $this->exclusionaryEvents()->sync(NxEvent::whereIn('id', $attributes['exclusionaryEvents'])->pluck('id')->toArray());
        }

        if (isset($attributes['lectors'])) {
            $this->lectors()->sync(User::whereIn('id', $attributes['lectors'])->pluck('id')->toArray());
        }

        if (isset($attributes['attendeesGroups'])) {
            $idsMap = [];
            foreach ($attributes['attendeesGroups'] as $group) {
                $groupModel = AttendeesGroup::find($group['id']);
                if ($groupModel) {
                    $groupModel->updatePeopleList($group);
                } else {
                    $groupModel = AttendeesGroup::createNew($group);
                    $this->attendeesGroups()->save($groupModel);
                }
                $idsMap[$groupModel->id] = true;
            }

            $ids = $this->attendeesGroups()->pluck('id');
            foreach ($ids as $id) {
                if (!isset($idsMap[$id])) {
                    AttendeesGroup::find($id)->delete();
                }
            }
        }

        if (isset($attributes['feedbackLink'])) {
            $response = \FeedbackForms::validate($attributes['feedbackLink']);

            if ($response['code'] != 200) {
                return response()->json([
                  'code' => 500,
                  'error' => $response['error'],
                ]);
            }

            $this->publicFeedbackLink = $response['publicResponseUrl'];
        }

        if (isset($attributes['semester']) && $attributes['semester']) {
            $semester = \App\Semester::findOrFail($attributes['semester']);
            $this->semesterId = $semester->id;
        }

        $this->save();
    }

    public function getSettings()
    {
        $settings = $this->settings;
        if (!$settings) {
            $settings = \App\DefaultSystemSettings::getNxEventsSettings();
        }

        return $settings;
    }

    public function canSignInAttendee($attendee)
    {
        $event = $attendee->attendeesGroup->nxEvent;
        if ($this->id !== $event->id) {
            throw new Exception("Attendee: ".$attendee->id." does not belong to the event", 1);
        }

        // check if attendee group max capacity was reached
        $group = $attendee->attendeesGroup;
        if ($group->signUpDeadlineDateTime->lt(\Carbon\Carbon::now())) {
            return trans('events.groupSignInExpired', ['eventName' => $this->name]);
        }

        $signedIn = $group->attendees()->whereNotNull('signedIn')->count();
        if ($signedIn >= $group->maxCapacity) {
            return trans('events.groupSignInsAreMaxed', ['eventName' => $this->name]);
        }

        $signedIn = 0;
        foreach ($this->attendeesGroups as $group) {
            $signedIn += $group->attendees()->whereNotNull('signedIn')->count();
        }

        if ($signedIn >= $this->maxCapacity) {
            return trans('events.eventSignInsAreMaxed', ['eventName' => $this->name]);
        }

        return true;
    }

    public static function getArchivedEvents()
    {
        return NxEvent::where('eventEndDateTime', '<', Carbon::now()->subMonth()->toDateString())
                        ->where('status', '=', 'published')->get();
    }

    public static function getPublishedEvents()
    {
        return NxEvent::where('status', '=', 'published')
                       ->where('eventEndDateTime', '>', Carbon::now()->subMonth()->toDateString())->get();
    }

    public static function getDraftEvents()
    {
        return NxEvent::where('status', '!=', 'published')->get();
    }

    public static function getBeforeSignInOpeningEvents()
    {
        return NxEvent::where('status', '=', 'published')
                       ->where('eventStartDateTime', '>', Carbon::now()->toDateString())
                       ->whereDoesntHave('attendeesGroups', function ($query) {
                          $query->where('signUpOpenDateTime', '<', Carbon::now()->toDateString());
                       })
                       ->get();
    }

    public static function getOpenedSignInEvents()
    {
        return NxEvent::where('status', '=', 'published')
                       ->where('eventStartDateTime', '>', Carbon::now()->toDateString())
                       ->whereHas('attendeesGroups', function ($query) {
                          $query->where('signUpOpenDateTime', '<', Carbon::now()->toDateString())
                                ->where('signUpDeadlineDateTime', '>', Carbon::now()->toDateString());
                       })
                       ->get();
    }

    public static function getClosedSignInEvents()
    {
        return NxEvent::where('status', '=', 'published')
                       ->where('eventStartDateTime', '>', Carbon::now()->toDateString())
                       ->whereDoesntHave('attendeesGroups', function ($query) {
                          $query->where('signUpOpenDateTime', '<', Carbon::now()->toDateString())
                                ->where('signUpDeadlineDateTime', '>', Carbon::now()->toDateString());
                       })
                       ->whereDoesntHave('attendeesGroups', function ($query) {
                          $query->where('signUpOpenDateTime', '>', Carbon::now()->toDateString())
                                ->where('signUpDeadlineDateTime', '>', Carbon::now()->toDateString());
                       })
                       ->get();
    }

    public static function getWaitingForFeedbackEvents()
    {
        $settings = \App\DefaultSystemSettings::getNxEventsSettings();
        $fedbackDeadlineDays = $settings['feedbackEmailDelay'] + $settings['feedbackDaysToFill'];

        $noSettings = NxEvent::where('status', '=', 'published')
                       ->where('eventEndDateTime', '<', Carbon::now()->toDateString())
                       ->doesntHave('settings')
                       ->where('eventEndDateTime', '>', Carbon::now()->subDays($fedbackDeadlineDays + 1)->toDateString())
                       ->get();

        $hasSettings = NxEvent::where('status', '=', 'published')
                       ->where('eventEndDateTime', '<', Carbon::now()->toDateString())
                       ->has('settings')
                       ->get()
                       ->filter(function ($event) {
                          $settings = $event->settings;
                          $fedbackDeadlineDays = $settings['feedbackEmailDelay'] + $settings['feedbackDaysToFill'];
                          return $event->eventEndDateTime->gt(Carbon::now()->subDays($fedbackDeadlineDays));
                       });

        return $noSettings->merge($hasSettings);
    }

    public static function getWaitingForEvaluationEvents()
    {
        $settings = \App\DefaultSystemSettings::getNxEventsSettings();
        $fedbackDeadlineDays = $settings['feedbackEmailDelay'] + $settings['feedbackDaysToFill'];

        $noSettings = NxEvent::where('status', '=', 'published')
                       ->doesntHave('settings')
                       ->where('eventEndDateTime', '>', Carbon::now()->subDays(30)->toDateString())
                       ->where('eventEndDateTime', '<', Carbon::now()->subDays($fedbackDeadlineDays)->toDateString())
                       ->get();

        $hasSettings = NxEvent::where('status', '=', 'published')
                       ->where('eventEndDateTime', '<', Carbon::now()->toDateString())
                       ->where('eventEndDateTime', '>', Carbon::now()->subDays(30)->toDateString())
                       ->has('settings')
                       ->get()
                       ->filter(function ($event) {
                          $settings = $event->settings;
                          $fedbackDeadlineDays = $settings['feedbackEmailDelay'] + $settings['feedbackDaysToFill'];
                          return $event->eventEndDateTime->lt(Carbon::now()->subDays($fedbackDeadlineDays));
                       });

        return $noSettings->merge($hasSettings);
    }

    public function attendeesGroups()
    {
        return $this->hasMany('App\AttendeesGroup', 'eventId');
    }

    public function lectors()
    {
        return $this->belongsToMany('App\User');
    }

    public function groupedEvents()
    {
        return $this->belongsToMany('App\NxEvent', 'nx_grouped_events', 'nx_event_parent_id', 'nx_event_id');
    }

    public function exclusionaryEvents()
    {
        return $this->belongsToMany('App\NxEvent', 'nx_exclusionary_events', 'nx_event_parent_id', 'nx_event_id');
    }

    public function getParentEvent()
    {
        return $this->belongsToMany('App\NxEvent', 'nx_grouped_events', 'nx_event_id', 'nx_event_parent_id')->first();
    }

    public function host()
    {
        return $this->belongsTo('App\User', 'hostId');
    }

    public function location()
    {
        return $this->belongsTo('App\NxLocation', 'nxLocationId');
    }

    public function curriculumLevel()
    {
        return $this->hasOne('App\StudentLevel', 'curriculumLevelId');
    }

    public function semester()
    {
        return $this->belongsTo('App\Semester', 'semesterId');
    }

    public function settings()
    {
        return $this->hasOne('App\NxEventsSettings', 'eventId');
    }
}
