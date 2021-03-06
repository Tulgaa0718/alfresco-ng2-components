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
import path = require('path');
import remote = require('selenium-webdriver/remote');
import { browser, by, element, protractor } from 'protractor';
import { FormControllersPage } from '@alfresco/adf-testing';
import { BrowserVisibility } from '@alfresco/adf-testing';

export class VersionManagePage {

    formControllersPage = new FormControllersPage();

    showNewVersionButton = element(by.id('adf-show-version-upload-button'));
    uploadNewVersionButton = element(by.css('adf-upload-version-button input[data-automation-id="upload-single-file"]'));
    uploadNewVersionContainer = element(by.id('adf-new-version-uploader-container'));
    cancelButton = element(by.id('adf-new-version-cancel'));
    majorRadio = element(by.id('adf-new-version-major'));
    minorRadio = element(by.id('adf-new-version-minor'));
    commentText = element(by.id('adf-new-version-text-area'));
    readOnlySwitch = element(by.id('adf-version-manager-switch-readonly'));
    downloadSwitch = element(by.id('adf-version-manager-switch-download'));
    commentsSwitch = element(by.id('adf-version-manager-switch-comments'));

    checkUploadNewVersionsButtonIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.showNewVersionButton);
        return this;
    }

    checkMajorChangeIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.majorRadio);
        return this;
    }

    checkMinorChangeIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.minorRadio);
        return this;
    }

    checkCommentTextIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.commentText);
        return this;
    }

    clickAddNewVersionsButton() {
        BrowserVisibility.waitUntilElementIsVisible(this.showNewVersionButton);
        this.showNewVersionButton.click();
        return this;
    }

    checkCancelButtonIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.cancelButton);
        return this;
    }

    uploadNewVersionFile(fileLocation) {
        browser.setFileDetector(new remote.FileDetector());
        BrowserVisibility.waitUntilElementIsVisible(this.uploadNewVersionButton);
        this.uploadNewVersionButton.sendKeys(path.resolve(path.join(TestConfig.main.rootPath, fileLocation)));
        BrowserVisibility.waitUntilElementIsVisible(this.showNewVersionButton);
        return this;
    }

    getFileVersionName(version) {
        const fileElement = element(by.css(`[id="adf-version-list-item-name-${version}"]`));
        BrowserVisibility.waitUntilElementIsVisible(fileElement);
        return fileElement.getText();
    }

    checkFileVersionExist(version) {
        const fileVersion = element(by.id(`adf-version-list-item-version-${version}`));
        return BrowserVisibility.waitUntilElementIsVisible(fileVersion);
    }

    checkFileVersionNotExist(version) {
        const fileVersion = element(by.id(`adf-version-list-item-version-${version}`));
        return BrowserVisibility.waitUntilElementIsNotVisible(fileVersion);
    }

    getFileVersionComment(version) {
        const fileComment = element(by.id(`adf-version-list-item-comment-${version}`));
        BrowserVisibility.waitUntilElementIsVisible(fileComment);
        return fileComment.getText();
    }

    getFileVersionDate(version) {
        const fileDate = element(by.id(`adf-version-list-item-date-${version}`));
        BrowserVisibility.waitUntilElementIsVisible(fileDate);
        return fileDate.getText();
    }

    enterCommentText(text) {
        BrowserVisibility.waitUntilElementIsVisible(this.commentText);
        this.commentText.sendKeys('');
        this.commentText.clear();
        this.commentText.sendKeys(text);
        return this;
    }

    clickMajorChange() {
        const radioMajor = element(by.id(`adf-new-version-major`));
        BrowserVisibility.waitUntilElementIsVisible(radioMajor);
        radioMajor.click();
    }

    clickMinorChange() {
        const radioMinor = element(by.id(`adf-new-version-minor`));
        BrowserVisibility.waitUntilElementIsVisible(radioMinor);
        radioMinor.click();
    }

    /**
     * disables readOnly
     */
    disableReadOnly() {
        this.formControllersPage.disableToggle(this.readOnlySwitch);
    }

    /**
     * enables readOnly
     */
    enableReadOnly() {
        this.formControllersPage.enableToggle(this.readOnlySwitch);
    }

    /**
     * disables download
     */
    disableDownload() {
        this.formControllersPage.disableToggle(this.downloadSwitch);
    }

    /**
     * enables download
     */
    enableDownload() {
        this.formControllersPage.enableToggle(this.downloadSwitch);
    }

    /**
     *
     * disables comments
     */
    disableComments() {
        this.formControllersPage.disableToggle(this.commentsSwitch);
    }

    /**
     * enables comments
     */
    enableComments() {
        this.formControllersPage.enableToggle(this.commentsSwitch);
    }

    clickActionButton(version) {
        BrowserVisibility.waitUntilElementIsVisible(element(by.id(`adf-version-list-action-menu-button-${version}`)));
        element(by.id(`adf-version-list-action-menu-button-${version}`)).click();
        return this;
    }

    clickAcceptConfirm() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.id(`adf-confirm-accept`)));
        element(by.id(`adf-confirm-accept`)).click();
        return this;
    }

    clickCancelConfirm() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.id(`adf-confirm-cancel`)));
        element(by.id(`adf-confirm-cancel`)).click();
        return this;
    }

    closeActionButton() {
        const container = element(by.css('div.cdk-overlay-backdrop.cdk-overlay-transparent-backdrop.cdk-overlay-backdrop-showing'));
        BrowserVisibility.waitUntilElementIsVisible(container);
        container.click();
        BrowserVisibility.waitUntilElementIsNotVisible(container);
        return this;
    }

    downloadFileVersion(version) {
        this.clickActionButton(version);
        const downloadButton = element(by.id(`adf-version-list-action-download-${version}`));
        BrowserVisibility.waitUntilElementIsVisible(downloadButton);
        browser.driver.sleep(500);
        downloadButton.click();
        return this;
    }

    deleteFileVersion(version) {
        this.clickActionButton(version);
        const deleteButton = element(by.id(`adf-version-list-action-delete-${version}`));
        BrowserVisibility.waitUntilElementIsVisible(deleteButton);
        browser.driver.sleep(500);
        deleteButton.click();
        return this;
    }

    restoreFileVersion(version) {
        this.clickActionButton(version);
        const restoreButton = element(by.id(`adf-version-list-action-restore-${version}`));
        BrowserVisibility.waitUntilElementIsVisible(restoreButton);
        browser.driver.sleep(500);
        restoreButton.click();
        return this;
    }

    checkActionsArePresent(version) {
        BrowserVisibility.waitUntilElementIsVisible(element(by.id(`adf-version-list-action-download-${version}`)));
        BrowserVisibility.waitUntilElementIsVisible(element(by.id(`adf-version-list-action-delete-${version}`)));
        BrowserVisibility.waitUntilElementIsVisible(element(by.id(`adf-version-list-action-restore-${version}`)));
    }

    closeVersionDialog() {
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        BrowserVisibility.waitUntilElementIsNotOnPage(this.uploadNewVersionContainer);
    }
}
