import { TASK_STATUS, TASK_USER_RATING } from "../enums/type-enums";

export interface Task {
    id: string;
    name: string;
    description: string;
    storyPoint?: number;
    status: TASK_STATUS;
    userRating?: TASK_USER_RATING;
}