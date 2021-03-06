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

import TestConfig = require('../test.config');

import {
    StringUtil, TasksService,
    ProcessDefinitionsService, ProcessInstancesService,
    LoginSSOPage, ApiService,
    SettingsPage, AppListCloudPage, LocalStorageUtil, IdentityService, RolesService
} from '@alfresco/adf-testing';
import { NavigationBarPage } from '../pages/adf/navigationBarPage';
import { TasksCloudDemoPage } from '../pages/adf/demo-shell/process-services/tasksCloudDemoPage';
import { TaskListCloudConfiguration } from './taskListCloud.config';

import moment = require('moment');
import { DateUtil } from '../util/dateUtil';

import resources = require('../util/resources');
import CONSTANTS = require('../util/constants');

describe('Edit task filters and task list properties', () => {

    const settingsPage = new SettingsPage();
    const loginSSOPage = new LoginSSOPage();
    const navigationBarPage = new NavigationBarPage();

    const appListCloudComponent = new AppListCloudPage();
    const tasksCloudDemoPage = new TasksCloudDemoPage();

    let tasksService: TasksService;
    let processDefinitionService: ProcessDefinitionsService;
    let processInstancesService: ProcessInstancesService;
    let identityService: IdentityService;
    let rolesService: RolesService;

    const simpleApp = resources.ACTIVITI7_APPS.SIMPLE_APP.name;
    const candidateUserApp = resources.ACTIVITI7_APPS.CANDIDATE_USER_APP.name;
    const noTasksFoundMessage = 'No Tasks Found';
    const user = TestConfig.adf.adminEmail, password = TestConfig.adf.adminPassword;
    let createdTask, notAssigned, notDisplayedTask, processDefinition, processInstance, priorityTask, subTask, otherOwnerTask;
    const priority = 30;

    const beforeDate = moment().add(-1, 'days').format('DD/MM/YYYY');
    const currentDate = DateUtil.formatDate('DD/MM/YYYY');
    const afterDate = moment().add(1, 'days').format('DD/MM/YYYY');

    beforeAll(async (done) => {
        const jsonFile = new TaskListCloudConfiguration().getConfiguration();
        settingsPage.setProviderBpmSso(TestConfig.adf.hostBPM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, false);
        loginSSOPage.clickOnSSOButton();
        loginSSOPage.loginSSOIdentityService(user, password);

        await LocalStorageUtil.setConfigField('adf-cloud-task-list', JSON.stringify(jsonFile));
        await LocalStorageUtil.setConfigField('adf-edit-task-filter', JSON.stringify({
            'filterProperties': [
                'taskId',
                'appName',
                'status',
                'assignee',
                'taskName',
                'parentTaskId',
                'priority',
                'standAlone',
                'owner',
                'processDefinitionId',
                'processInstanceId',
                'lastModified',
                'sort',
                'order'
            ],
            'sortProperties': [
                'id',
                'name',
                'createdDate',
                'priority',
                'processDefinitionId',
                'processInstanceId',
                'parentTaskId',
                'priority',
                'standAlone',
                'owner',
                'assignee'
            ],
            'actions': [
                'save',
                'saveAs',
                'delete'
            ]
        }));

        const apiService = new ApiService('activiti', TestConfig.adf.hostBPM, TestConfig.adf.hostSso, 'BPM');
        await apiService.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        identityService = new IdentityService(apiService);
        rolesService = new RolesService(apiService);
        tasksService = new  TasksService(apiService);

        const apsUser = await identityService.createIdentityUser();
        const apsUserRoleId = await rolesService.getRoleIdByRoleName(CONSTANTS.ROLES.APS_USER);
        await identityService.assignRole(apsUser.idIdentityService, apsUserRoleId, CONSTANTS.ROLES.APS_USER);

        await apiService.login(apsUser.email, apsUser.password);
        otherOwnerTask = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), simpleApp);
        await tasksService.claimTask(otherOwnerTask.entry.id, simpleApp);

        await apiService.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        createdTask = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), simpleApp);
        await tasksService.claimTask(createdTask.entry.id, simpleApp);
        notAssigned = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), simpleApp);
        priorityTask = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), simpleApp, {priority: priority});
        await tasksService.claimTask(priorityTask.entry.id, simpleApp);
        notDisplayedTask = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), candidateUserApp);
        await tasksService.claimTask(notDisplayedTask.entry.id, candidateUserApp);

        processDefinitionService = new ProcessDefinitionsService(apiService);
        processDefinition = await processDefinitionService.getProcessDefinitions(simpleApp);
        processInstancesService = new ProcessInstancesService(apiService);
        processInstance = await processInstancesService.createProcessInstance(processDefinition.list.entries[0].entry.key, simpleApp);

        subTask = await tasksService.createStandaloneSubtask(createdTask.entry.id, simpleApp, StringUtil.generateRandomString());
        await tasksService.claimTask(subTask.entry.id, simpleApp);

        done();
    });

    describe('Edit task filters and task list properties - filter properties', () => {

        beforeEach((done) => {
            navigationBarPage.navigateToProcessServicesCloudPage();
            appListCloudComponent.checkApsContainer();
            appListCloudComponent.goToApp(simpleApp);
            tasksCloudDemoPage.editTaskFilterCloudComponent().clickCustomiseFilterHeader();
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            done();
        });

        it('[C292004] Filter by appName', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            expect(tasksCloudDemoPage.editTaskFilterCloudComponent().getAppNameDropDownValue()).toEqual(simpleApp);

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(notDisplayedTask.entry.name);

            tasksCloudDemoPage.editTaskFilterCloudComponent().setAppNameDropDown(candidateUserApp);
            expect(tasksCloudDemoPage.editTaskFilterCloudComponent().getAppNameDropDownValue()).toEqual(candidateUserApp);

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(notDisplayedTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(createdTask.entry.name);
        });

        it('[C291906] Should be able to see only the task with specific taskId when typing it in the task Id field', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setId(createdTask.entry.id);
            expect(tasksCloudDemoPage.editTaskFilterCloudComponent().getId()).toEqual(createdTask.entry.id);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedById(createdTask.entry.id);
            tasksCloudDemoPage.taskListCloudComponent().getRowsWithSameId(createdTask.entry.id).then((list) => {
                expect(list.length).toEqual(1);
            });
        });

        it('[C291907] Should be able to see No tasks found when typing an invalid task id', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setId('invalidId');
            expect(tasksCloudDemoPage.editTaskFilterCloudComponent().getId()).toEqual('invalidId');

            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

        it('[C297476] Filter by taskName', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setTaskName(createdTask.entry.name);
            expect(tasksCloudDemoPage.editTaskFilterCloudComponent().getTaskName()).toEqual(createdTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().getRowsWithSameName(createdTask.entry.name).then((list) => {
                expect(list.length).toEqual(1);
            });
        });

        it('[C297613] Should be able to see No tasks found when typing a task name that does not exist', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setTaskName('invalidName');
            expect(tasksCloudDemoPage.editTaskFilterCloudComponent().getTaskName()).toEqual('invalidName');

            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

        it('[C297480] Should be able to see only tasks that are part of a specific process when processInstanceId is set', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setProcessInstanceId(processInstance.entry.id)
                .setStatusFilterDropDown('ALL').clearAssignee();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            expect(tasksCloudDemoPage.taskListCloudComponent().getDataTable().getNumberOfRows()).toBe(1);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByProcessInstanceId(processInstance.entry.id);
        });

        it('[C297684] Should be able to see No tasks found when typing an invalid processInstanceId', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setProcessInstanceId('invalidTaskId');

            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

        it('[C297478] Should be able to see only tasks that are assigned to a specific user when assignee is set', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setAssignee('admin.adf');

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(notAssigned.entry.name);
        });

        it('[C297686] Should be able to see No tasks found when typing an invalid user to assignee field', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setAssignee('invalid');

            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

        it('[C297482] Should be able to see only tasks with specific priority when priority is set', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setPriority(priority);

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(priorityTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(createdTask.entry.name);
        });

        it('[C297687] Should be able to see No tasks found when typing unused value for priority field', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');
            tasksCloudDemoPage.editTaskFilterCloudComponent().setPriority('87650');

            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

        it('[C297481] Should be able to see only tasks with specific parentTaskId when parentTaskId is set', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setParentTaskId(subTask.entry.parentTaskId);

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(subTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(createdTask.entry.name);
        });

        it('[C297486] Filter by Owner', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setStatusFilterDropDown('ALL').clearAssignee().setOwner('admin.adf');

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(notAssigned.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOwner('invalid');

            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

        it('[C297484] Task is displayed when typing into lastModifiedFrom field a date before the task CreatedDate', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedFrom(beforeDate);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedFrom(afterDate);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(createdTask.entry.name);
        });

        it('[C297689] Task is not displayed when typing into lastModifiedFrom field the same date as tasks CreatedDate', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedFrom(currentDate);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(createdTask.entry.name);
        });

        it('[C297485] Task is displayed when typing into lastModifiedTo field a date after the task CreatedDate', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedTo(afterDate);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedTo(beforeDate);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(createdTask.entry.name);
        });

        it('[C297690] Task is not displayed when typing into lastModifiedTo field the same date as tasks CreatedDate', () => {
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedTo(currentDate);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(createdTask.entry.name);
        });

        xit('[C297691] Task is not displayed when typing into lastModifiedFrom field a date before the task due date  ' +
            'and into lastModifiedTo a date before task due date', () => {

            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedFrom(beforeDate);
            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedTo(beforeDate);
            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

        it('[C297692] Task is displayed when typing into lastModifiedFrom field a date before the tasks due date ' +
            'and into lastModifiedTo a date after', () => {

            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedFrom(beforeDate);
            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedTo(afterDate);
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);
        });

        it('[C297693] Task is not displayed when typing into lastModifiedFrom field a date after the tasks due date ' +
            'and into lastModifiedTo a date after', () => {

            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedFrom(afterDate);
            tasksCloudDemoPage.editTaskFilterCloudComponent().setLastModifiedTo(afterDate);
            expect(tasksCloudDemoPage.taskListCloudComponent().getNoTasksFoundMessage()).toEqual(noTasksFoundMessage);
        });

    });

    describe('Edit task filters and task list properties - sort properties', () => {

        beforeEach((done) => {
            navigationBarPage.navigateToProcessServicesCloudPage();
            appListCloudComponent.checkApsContainer();
            appListCloudComponent.goToApp(simpleApp);
            tasksCloudDemoPage.editTaskFilterCloudComponent().clickCustomiseFilterHeader();
            tasksCloudDemoPage.myTasksFilter().checkTaskFilterIsDisplayed();
            done();
        });

        it('[C306901] Should display tasks sorted by task name when taskName is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().setStatusFilterDropDown('ASSIGNED')
                .setSortFilterDropDown('Name').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsNameColumn().then( (list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsNameColumn().then( (list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C290156] Should display tasks ordered by id when Id is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().setStatusFilterDropDown('ASSIGNED')
                .setSortFilterDropDown('Id').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C306903] Should display tasks sorted by processDefinitionId when processDefinitionId is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().setStatusFilterDropDown('ASSIGNED')
                .setSortFilterDropDown('ProcessDefinitionId').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByProcessDefIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByProcessDefIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C306905] Should display tasks sorted by processInstanceId when processInstanceId is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().setStatusFilterDropDown('ASSIGNED')
                .setSortFilterDropDown('ProcessInstanceId').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByProcessInstanceIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByProcessInstanceIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C306907] Should display tasks sorted by assignee when assignee is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().clearAssignee().setStatusFilterDropDown('ALL')
                .setSortFilterDropDown('Assignee').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByAssigneeColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByAssigneeColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C306911] Should display tasks sorted by parentTaskId when parentTaskId is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().clearAssignee().setStatusFilterDropDown('ALL')
                .setSortFilterDropDown('ParentTaskId').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByParentTaskIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByParentTaskIdColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C306909] Should display tasks sorted by priority when priority is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().clearAssignee().setStatusFilterDropDown('ALL')
                .setSortFilterDropDown('Priority').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByPriorityColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByPriorityColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C307114] Should display tasks sorted by standAlone when standAlone is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().clearAssignee().setStatusFilterDropDown('ALL')
                .setSortFilterDropDown('StandAlone').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByStandAloneColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByStandAloneColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });

        it('[C307115] Should display tasks sorted by owner when owner is selected from sort dropdown', () => {
            tasksCloudDemoPage.editTaskFilterCloudComponent().clearAssignee().setStatusFilterDropDown('ALL')
                .setSortFilterDropDown('Owner').setOrderFilterDropDown('ASC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();

            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByOwnerColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });

            tasksCloudDemoPage.editTaskFilterCloudComponent().setOrderFilterDropDown('DESC');
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getDataTable().checkSpinnerIsNotDisplayed();
            tasksCloudDemoPage.taskListCloudComponent().getAllRowsByOwnerColumn().then((list) => {
                const initialList = list.slice(0);
                list.sort(function (firstStr, secondStr) {
                    return firstStr.localeCompare(secondStr);
                });
                list.reverse();
                expect(JSON.stringify(initialList) === JSON.stringify(list)).toEqual(true);
            });
        });
    });

});
