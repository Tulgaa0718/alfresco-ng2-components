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

import TestConfig = require('../../test.config');

import { LoginPage } from '@alfresco/adf-testing';
import { ViewerPage } from '../../pages/adf/viewerPage';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';

import resources = require('../../util/resources');

import { FileModel } from '../../models/ACS/fileModel';
import { AcsUserModel } from '../../models/ACS/acsUserModel';

import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { UploadActions } from '@alfresco/adf-testing';

describe('Viewer', () => {

    const viewerPage = new ViewerPage();
    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const alfrescoJsApi = new AlfrescoApi({
        provider: 'ECM',
        hostEcm: TestConfig.adf.url
    });
    const uploadActions = new UploadActions(alfrescoJsApi);
    const acsUser = new AcsUserModel();
    let txtFileUploaded;

    const txtFileInfo = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.TXT.file_name,
        'location': resources.Files.ADF_DOCUMENTS.TXT.file_location
    });

    beforeAll(async (done) => {

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        txtFileUploaded = await uploadActions.uploadFile(txtFileInfo.location, txtFileInfo.name, '-my-');

        loginPage.loginToContentServicesUsingUserModel(acsUser);

        done();
    });

    afterAll(async (done) => {
        await uploadActions.deleteFileOrFolder(txtFileUploaded.entry.id);
        done();
    });

    beforeEach(() => {
        contentServicesPage.goToDocumentList();
        contentServicesPage.doubleClickRow(txtFileUploaded.entry.name);
    });

    afterEach(() => {
        viewerPage.clickCloseButton();
    });

    it('[C260096] Should the Viewer able to accept a customToolbar', () => {
        viewerPage.clickLeftSidebarButton();
        viewerPage.checkLeftSideBarIsDisplayed();
        viewerPage.checkToolbarIsDisplayed();
        viewerPage.enableCustomToolbar();
        viewerPage.checkCustomToolbarIsDisplayed();
        viewerPage.disableCustomToolbar();
    });

    it('[C260097] Should the viewer able to show a custom info-drawer when the sidebarTemplate is set', () => {
        viewerPage.clickInfoButton();
        viewerPage.checkInfoSideBarIsDisplayed();
        viewerPage.clickOnTab('Comments');
        viewerPage.checkTabIsActive('Comments');
        viewerPage.clickOnTab('Properties');
        viewerPage.checkTabIsActive('Properties');
        viewerPage.clickOnTab('Versions');
        viewerPage.checkTabIsActive('Versions');
    });
});
