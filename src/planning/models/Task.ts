import { UserInterface } from 'src/auth/interfaces/user.interfaces';
import { v4 as uuid } from 'uuid'
import { TASK_STATUS, TASK_STATUS_ENUMS, TASK_USER_RATING, USER_RATING_STORY_POINTS } from '../enums/type-enums';

export class Task {

    private taskId: string;
    private taskName: string;
    private storyPoint: number | null;
    private status: TASK_STATUS;
    private taskDescription: string;
    public userVoteList: TASK_USER_RATING[];
    public result: {}

    constructor(taskName: string, taskDescription: string) {
        this.taskId = uuid();
        this.taskName = taskName;
        this.storyPoint = null;
        this.status = TASK_STATUS_ENUMS.OPEN;
        this.taskDescription = taskDescription;
        this.userVoteList = [];
    }

    public getTask() {
        return {
            taskId: this.taskId,
            taskName: this.taskName,
            storyPoint: this.storyPoint,
            status: this.status,
            taskDescription: this.taskDescription,
            userVoteList: this.userVoteList,
        }
    }

    public getTaskId() {
        return this.taskId;
    }

    public getTaskName() {
        return this.taskName;
    }

    public getStoryPoint() {
        return this.storyPoint;
    }

    public setStoryPoint(point: number) {
        this.storyPoint = point;

        return this;
    }

    public getStatus() {
        return this.status;
    }

    public setStatus(status: TASK_STATUS) {
        this.status = status;

        return this;
    }

    public getTaskDescription() {
        return this.taskDescription;
    }

    public setTaskDescription(description: string) {
        this.taskDescription = description;

        return this;
    }

    public getuserVoteList() {
        return this.userVoteList;
    }

    public setUserVoteList({ user, vote }: TASK_USER_RATING): TASK_USER_RATING[] {

        // Gelen kullanıcı daha öncesinde rateList üzerinde bulunuyor mu ?
        const votedUserIndex = this.userVoteList.findIndex(rateList => rateList.user.uniqueId === user.uniqueId);

        // Kullanıcı listede bulunmuyorsa
        if (votedUserIndex === -1) {

            // userVoteList içerisine ekle
            this.userVoteList.push({ user, vote });

            // Vote list'i dön
            return this.userVoteList;
        }

        // Kullanıcının vote'unu güncelle
        this.userVoteList[votedUserIndex].vote = vote;

        // Vote list'i dön
        return this.userVoteList;

    }

    public generateUserVoteList(users: UserInterface[]): TASK_USER_RATING[] {
        const generatedUserVoteList = users.map(user => {
            
            const taskUserRatingData: TASK_USER_RATING = {
                user,
                vote: '-'
            }

            return taskUserRatingData;
        });

        this.userVoteList = generatedUserVoteList;

        return generatedUserVoteList;
    }

    public setResult(result: object) {
        this.result = result;
    }
}