<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\User;
use App\NxEvent;
use App\NxEventTerm;

class AutogenerateFeedbackFormRemainder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'autogenerate:feedbackFormRemainder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends feedback form remainder before deadline';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $today = Carbon::now()->format('Y-m-d');

        foreach (NxEventTerm::whereRaw('eventEndDateTime < NOW()')->get() as $term) {
            $event = $term->event;
            if ($term->feedbackLink == '' || $event->status !== 'published') {
                continue;
            }

            $settings = $event->getSettings();
            $feedbackDeadline = $term->eventEndDateTime->addDays($settings['feedbackDaysToFill'] + $settings['feedbackEmailDelay'] + 1);
            $remainderDate = $feedbackDeadline->subDays($settings['feedbackRemainderDaysBefore'])->format('Y-m-d');

            $respondentsEmails = [];
            if ($remainderDate === $today) {
                $maxRetries = 50;
                while ($maxRetries > 0) {
                    try {
                        $respondentsEmails = \FeedbackForms::getRespondents($term->feedbackLink)['respondents'];
                    } catch (\Exception $e) {
                        \Log::error($e->getMessage());
                        $maxRetries = $maxRetries - 1;
                        continue;
                    }
                    $maxRetries = 0;
                }
                
                $userIds = \App\User::whereIn('email', $respondentsEmails)->pluck('id');
                $manager = \App\User::findOrFail($settings['eventsManagerUserId']);

                
                $attendees = $term->attendees()->where(function ($query) use ($userIds) {
                    $query->whereIn('userId', $userIds);
                    $query->orWhere('filledFeedback', '=', true);
                })->get();
                foreach ($attendees as $attendee) {
                    $attendee->filledFeedback = true;
                    $attendee->save();
                }

                $attendees = $term->attendees()->where('wasPresent', '=', true)->where(function ($query) {
                    $query->where('filledFeedback', '=', false);
                    $query->orWhereNull('filledFeedback');
                })->get();

                foreach ($attendees as $attendee) {
                    $email = new \App\Mail\Events\EventFeedbackRemainderMail($event, $term, $attendee->user, $manager);
                    \Mail::send($email);
                }

                $sendCopyToManager = boolval($settings['sentCopyOfAllEventNotificationsToManager']);
                if ($sendCopyToManager) {
                    $email = new \App\Mail\Events\EventFeedbackRemainderMail($event, $term, $manager, $manager);
                    \Mail::send($email);
                }
            }
        }
    }
}
