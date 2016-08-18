<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'eventType',
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

        if (isset($attributes['followingEvents'])) {
            foreach ($attributes['followingEvents'] as $eventId) {
                $event->followingEvents()->save(NxEvent::findOrFail($eventId));
            }
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

        if (isset($attributes['followingEvents'])) {
            $this->followingEvents()->sync(NxEvent::whereIn('id', $attributes['followingEvents'])->lists('id')->toArray());
        }

        if (isset($attributes['lectors'])) {
            $this->lectors()->sync(User::whereIn('id', $attributes['lectors'])->lists('id')->toArray());
        }

        if (isset($attributes['attendeesGroups'])) {
            $idsMap = [];
            foreach ($attributes['attendeesGroups'] as $group) {
                $groupModel = AttendeesGroup::find($group['id']);
                if ($groupModel) {
                    $groupModel->updateData($group);
                } else {
                    $groupModel = AttendeesGroup::createNew($group);
                    $this->attendeesGroups()->save($groupModel);
                }
                $idsMap[$groupModel->id] = true;
            }

            $ids = $this->attendeesGroups()->lists('id');
            foreach ($ids as $id) {
                if (!isset($idsMap[$id])) {
                    AttendeesGroup::find($id)->delete();
                }
            }
        }

        $this->save();
    }

    public function attendeesGroups()
    {
        return $this->hasMany('App\AttendeesGroup', 'eventId');
    }

    public function lectors()
    {
        return $this->belongsToMany('App\User');
    }

    public function followingEvents()
    {
        return $this->belongsToMany('App\NxEvent', 'nx_event_nx_event', 'nx_event_parent_id', 'nx_event_id');
    }

    public function getParentEvent()
    {
        return $this->belongsToMany('App\NxEvent', 'nx_event_nx_event', 'nx_event_id', 'nx_event_parent_id')->first();
    }

    public function host()
    {
        return $this->hasOne('App\User', 'hostId');
    }

    public function location()
    {
        return $this->hasOne('App\NxLocation', 'nxLocationId');
    }

    public function curriculumLevel()
    {
        return $this->hasOne('App\StudentLevel', 'curriculumLevelId');
    }
}