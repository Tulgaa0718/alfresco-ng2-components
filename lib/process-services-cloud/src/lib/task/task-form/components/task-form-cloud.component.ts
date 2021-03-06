/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    Component, EventEmitter, Input, OnChanges,
    Output, SimpleChanges
} from '@angular/core';
import { FormCloud } from '../../../form/models/form-cloud.model';
import { TaskDetailsCloudModel } from '../../start-task/models/task-details-cloud.model';
import { TaskCloudService } from '../../services/task-cloud.service';
import { IdentityUserService, FormOutcomeModel } from '@alfresco/adf-core';

@Component({
    selector: 'adf-task-form-cloud',
    templateUrl: './task-form-cloud.component.html',
    styleUrls: ['./task-form-cloud.component.scss']
})
export class TaskFormCloudComponent implements OnChanges {

    /** App id to fetch corresponding form and values. */
    @Input()
    appName: string;

    /** Task id to fetch corresponding form and values. */
    @Input()
    taskId: string;

    /** Toggle rendering of the `Refresh` button. */
    @Input()
    showRefreshButton = false;

    /** Toggle rendering of the `Validation` icon. */
    @Input()
    showValidationIcon = true;

    /** Toggle rendering of the `Cancel` button. */
    @Input()
    showCancelButton = true;

    /** Toggle rendering of the `Complete` button. */
    @Input()
    showCompleteButton = true;

    /** Toggle readonly state of the task. */
    @Input()
    readOnly = false;

    /** Emitted when the form is saved. */
    @Output()
    formSaved: EventEmitter<FormCloud> = new EventEmitter<FormCloud>();

    /** Emitted when the form is submitted with the `Complete` outcome. */
    @Output()
    formCompleted: EventEmitter<FormCloud> = new EventEmitter<FormCloud>();

    /** Emitted when the task is completed. */
    @Output()
    taskCompleted: EventEmitter<string> = new EventEmitter<string>();

    /** Emitted when the task is claimed. */
    @Output()
    taskClaimed: EventEmitter<string> = new EventEmitter<string>();

    /** Emitted when the task is unclaimed. */
    @Output()
    taskUnclaimed: EventEmitter<string> = new EventEmitter<string>();

    /** Emitted when the cancel button is clicked. */
    @Output()
    cancelClick: EventEmitter<string> = new EventEmitter<string>();

    /** Emitted when any error occurs. */
    @Output()
    error: EventEmitter<any> = new EventEmitter<any>();

    taskDetails: TaskDetailsCloudModel;

    constructor(
        private taskCloudService: TaskCloudService,
        private identityUserService: IdentityUserService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        const appName = changes['appName'];
        if (appName && appName.currentValue && this.taskId) {
            this.loadTask();
            return;
        }

        const taskId = changes['taskId'];
        if (taskId && taskId.currentValue && this.appName) {
            this.loadTask();
            return;
        }

    }

    loadTask() {
        this.taskCloudService.getTaskById(this.appName, this.taskId).subscribe((details: TaskDetailsCloudModel) => {
            this.taskDetails = details;
        });
    }

    hasForm(): boolean {
        return this.taskDetails && !!this.taskDetails.formKey;
    }

    canCompleteTask(): boolean {
        return this.showCompleteButton && !this.readOnly && this.taskCloudService.canCompleteTask(this.taskDetails);
    }

    canClaimTask(): boolean {
        return !this.readOnly && this.taskCloudService.canClaimTask(this.taskDetails);
    }

    canUnclaimTask(): boolean {
        return !this.readOnly && this.taskCloudService.canUnclaimTask(this.taskDetails);
    }

    isReadOnly(): boolean {
        return this.readOnly || this.taskDetails.isCompleted();
    }

    onCompleteTask() {
        this.taskCompleted.emit(this.taskId);
    }

    onClaimTask() {
        this.taskClaimed.emit(this.taskId);
    }

    onUnclaimTask() {
        this.taskUnclaimed.emit(this.taskId);
    }

    onCancelClick() {
        this.cancelClick.emit(this.taskId);
    }

    claimTask() {
        const currentUser = this.identityUserService.getCurrentUserInfo().username;
        this.taskCloudService.claimTask(this.appName, this.taskId, currentUser).subscribe(
            () => {
                this.taskClaimed.emit(this.taskId);
            });
    }

    unclaimTask() {
        this.taskCloudService.unclaimTask(this.appName, this.taskId).subscribe(
            () => {
                this.taskUnclaimed.emit(this.taskId);
            });
    }

    onExecuteOutcome(outcome: FormOutcomeModel) {
        if (outcome.id === FormCloud.CANCEL_OUTCOME) {
            this.onCancelClick();
        } else if (outcome.id === FormCloud.CLAIM_OUTCOME) {
            this.claimTask();
        } else if (outcome.id === FormCloud.UNCLAIM_OUTCOME) {
            this.unclaimTask();
        }
    }

    onFormSaved(form: FormCloud) {
        this.formSaved.emit(form);
    }

    onFormCompleted(form: FormCloud) {
        this.formCompleted.emit(form);
        this.taskCompleted.emit(this.taskId);
    }

    onError(data: any) {
        this.error.emit(data);
    }
}
