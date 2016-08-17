<?php namespace App\Transformers;


class AttendeesGroupTransformer extends Transformer
{

    public function transform($group)
    {
        $transformer = new NxEventAttendeeTransformer();
        $users = [];
        foreach ($group->attendees as $attendee) {
            $users[] = $transformer->transform($attendee);
        }

        return [
            'id' => (int) $group->id,
            'name' => $group->name,
            'signUpOpenDateTime' => $group->signUpOpenDateTime ? $group->signUpOpenDateTime->__toString() : null,
            'signUpDeadlineDateTime' => $group->signUpDeadlineDateTime ? $group->signUpDeadlineDateTime->__toString() : null,
            'minCapacity' => (int) $group->minCapacity,
            'maxCapacity' => (int) $group->maxCapacity,
            'users' => $users,
         ];
    }
}
