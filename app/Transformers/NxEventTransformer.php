<?php namespace App\Transformers;

use App\Transformers\AttendeesGroupTransformer;

class NxEventTransformer extends Transformer
{

    public function transform($event)
    {
        $transformer = new AttendeesGroupTransformer();
        $attendees = $transformer->transformCollection($event->attendeesGroups);

        return [
            'id' => (int) $event->id,
            'name' => $event->name,
            'eventType' => $event->eventType,
            'feedbackLink' => $event->feedbackLink,
            'publicFeedbackLink' => $event->publicFeedbackLink,
            'description' => $event->description,
            'shortDescription' => $event->shortDescription,
            'activityPoints' => (int) $event->activityPoints,
            'eventStartDateTime' => $event->eventStartDateTime ? $event->eventStartDateTime->toIso8601String() : null,
            'eventEndDateTime' => $event->eventEndDateTime ? $event->eventEndDateTime->toIso8601String() : null,
            'minCapacity' => (int) $event->minCapacity,
            'maxCapacity' => (int) $event->maxCapacity,
            'mandatoryParticipation' => $event->mandatoryParticipation,
            'hostId' => (int) $event->hostId,
            'nxLocationId' => (int) $event->nxLocationId,
            'attendeesGroups' => $attendees,
            'lectors' => array_map('intval', $event->lectors()->pluck('id')->toArray()),
            'parentEventId' => $event->getParentEvent() ? (int) $event->getParentEvent()->id : null,
            'status' => $event->status,
            'groupedEvents' => array_map('intval', $event->groupedEvents()->pluck('id')->toArray()),
            'exclusionaryEvents' => array_map('intval', $event->exclusionaryEvents()->pluck('id')->toArray()),
            'curriculumLevelId' => (int) $event->curriculumLevelId,
            'semester' => $event->semester ? (int) $event->semester->id : null,
         ];
    }
}
