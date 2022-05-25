import { UserInterface } from "src/auth/interfaces/user.interfaces";
import { User } from "src/auth/models/User";
import { Task } from "../interfaces/planning.interfaces";

/**
 * Task Status
 * 
 * @author [suleymansevimli](https://github.com/suleymansevimli)
 */
export type TASK_STATUS = 'OPEN' | 'IN_PROGRESS' | 'DONE';

/**
 * Task Status Enums
 * 
 * @author [suleymansevimli](https://github.com/suleymansevimli)
 */
export enum TASK_STATUS_ENUMS {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
};

/**
 * Task with Status Type Response Type
 */
export type TASK_WITH_STATUS = {
    OPEN: Task[],
    IN_PROGRESS: Task[],
    DONE: Task[],
}

/**
 * User Rating Story Points
 * 
 * @author [suleymansevimli](https://github.com/suleymansevimli)
 */
export type USER_RATING_STORY_POINTS = '-' | '1' | '2' | '3' | '5' | '8' | '13' | 'infinity' | 'coffee' | 'unknown';

/**
 * Task User Rating
 * 
 * @author [suleymansevimli](https://github.com/suleymansevimli)
 */
export type TASK_USER_RATING = {
    user: UserInterface,
    vote: USER_RATING_STORY_POINTS,
};