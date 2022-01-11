import { TASK_STATUS, TASK_USER_RATING } from "../enums/type-enums";

export interface Task {
    id: string;
    name: string;
    description: string;
    storyPoint?: number | null;
    status: TASK_STATUS;
    usersRating?: TASK_USER_RATING[] | [];
}