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

import { TestConfig } from '../../../../e2e/test.config.js';
import { LoginPage } from '@alfresco/adf-testing';
import { ViewerPage } from '../../../pages/adf/viewerPage';
import { ContentServicesPage } from '../../../pages/adf/contentServicesPage';

import { CONSTANTS } from '../../../util/constants.js';
import resources = require('../../../util/resources.js');
import { StringUtil } from '@alfresco/adf-testing';

import { FolderModel } from '../../../models/ACS/folderModel';
import { AcsUserModel } from '../../../models/ACS/acsUserModel';

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
    let site;
    const acsUser = new AcsUserModel();

    const archiveFolderInfo = new FolderModel({
        'name': resources.Files.ADF_DOCUMENTS.ARCHIVE_FOLDER.folder_name,
        'location': resources.Files.ADF_DOCUMENTS.ARCHIVE_FOLDER.folder_location
    });

    beforeAll(async (done) => {
        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        site = await this.alfrescoJsApi.core.sitesApi.createSite({
            title: StringUtil.generateRandomString(8),
            visibility: 'PUBLIC'
        });

        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: acsUser.id,
            role: CONSTANTS.CS_USER_ROLES.MANAGER
        });

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        done();
    });

    describe('Archive Folder Uploaded', () => {
        let uploadedArchives;
        let archiveFolderUploaded;

        beforeAll(async (done) => {
            archiveFolderUploaded = await uploadActions.createFolder(archiveFolderInfo.name, '-my-');

            uploadedArchives = await uploadActions.uploadFolder(archiveFolderInfo.location, archiveFolderUploaded.entry.id);

            loginPage.loginToContentServicesUsingUserModel(acsUser);
            contentServicesPage.goToDocumentList();

            done();
        });

        afterAll(async (done) => {
            await uploadActions.deleteFileOrFolder(archiveFolderUploaded.entry.id);
            done();
        });

        it('[C260517] Should be possible to open any Archive file', () => {
            contentServicesPage.doubleClickRow('archive');

            uploadedArchives.forEach((currentFile) => {
                if (currentFile.entry.name !== '.DS_Store') {
                    contentServicesPage.doubleClickRow(currentFile.entry.name);
                    viewerPage.checkFileIsLoaded();
                    viewerPage.clickCloseButton();
                }
            });
        });

    });
});