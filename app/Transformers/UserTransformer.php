<?php namespace App\Transformers;

use App\Transformers\RoleTransformer;

class UserTransformer extends Transformer
{
    public function transform($user)
    {
        $transformer = new RoleTransformer();
        $roles = $transformer->transformCollection($user->roles);

        return [
            'id' => (int) $user->id,
            'firstName' => $user->firstName,
            'username' => $user->username,
            'lastName' => $user->lastName,
            'email' => $user->email,
            'phone' => $user->phone,
            'variableSymbol' => $user->variableSymbol,
            'facebookLink' => $user->facebookLink,
            'linkedinLink' => $user->linkedinLink,
            'personalDescription' => $user->personalDescription,
            'photo' => $user->photo,
            'actualJobInfo' => $user->actualJobInfo,
            'school' => $user->school,
            'faculty' => $user->faculty,
            'studyProgram' => $user->studyProgram,
            'roles' => $roles,
            'activityPoints' => $user->activityPoints,
            'guideDescription' => $user->guideDescription,
            'lectorDescription' => $user->lectorDescription,
            'buddyDescription' => $user->buddyDescription,
            'state' => $user->state,
            'nexteriaTeamRole' => $user->nexteriaTeamRole,
            'studentLevelId' => (int) $user->studentLevelId,
            'created_at' => $user->created_at ? $user->created_at->__toString() : null ,
            'updated_at' => $user->updated_at ? $user->updated_at->__toString() : null ,
         ];
    }
}