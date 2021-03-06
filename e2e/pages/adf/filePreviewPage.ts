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

import { browser, by, element, protractor } from 'protractor';
import { BrowserVisibility } from '@alfresco/adf-testing';

export class FilePreviewPage {

    pdfTitleFromSearch = element(by.css(`span[id='adf-viewer-display-name']`));
    textLayer = element.all(by.css(`div[class='textLayer']`)).first();
    closeButton = element(by.css('button[data-automation-id="adf-toolbar-back"]'));

    waitForElements() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`i[id='viewer-close-button']`)));
    }

    viewFile(fileName) {
        BrowserVisibility.waitUntilElementIsVisible(element(by.cssContainingText(`div[data-automation-id="${fileName}"]`, fileName)));
        browser.actions().doubleClick(element(by.cssContainingText(`div[data-automation-id="${fileName}"]`, fileName))).perform();
        this.waitForElements();
    }

    getPDFTitleFromSearch() {
        const deferred = protractor.promise.defer();
        BrowserVisibility.waitUntilElementIsVisible(this.pdfTitleFromSearch);
        BrowserVisibility.waitUntilElementIsVisible(this.textLayer);
        this.pdfTitleFromSearch.getText().then((result) => {
            deferred.fulfill(result);
        });
        return deferred.promise;
    }

    checkCloseButton() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`i[id='viewer-close-button']`)));
    }

    checkOriginalSizeButton() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.cssContainingText(`div[id='viewer-scale-page-button'] > i `, `zoom_out_map`)));
    }

    checkZoomInButton() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`div[id='viewer-zoom-in-button']`)));

    }

    checkZoomOutButton() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`div[id='viewer-zoom-out-button']`)));
    }

    checkPreviousPageButton() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`div[id='viewer-previous-page-button']`)));
    }

    checkNextPageButton() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`div[id='viewer-next-page-button']`)));
    }

    checkDownloadButton() {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`button[id='viewer-download-button']`)));
    }

    checkCurrentPageNumber(pageNumber) {
        BrowserVisibility.waitUntilElementIsVisible(element(by.css(`input[id='viewer-pagenumber-input'][ng-reflect-value="${pageNumber}"]`)));
    }

    checkText(pageNumber, text) {
        const allPages = element.all(by.css(`div[class='canvasWrapper'] > canvas`)).first();
        const pageLoaded = element(by.css(`div[id="pageContainer${pageNumber}"][data-loaded='true']`));
        const textLayerLoaded = element(by.css(`div[id="pageContainer${pageNumber}"] div[class='textLayer'] > div`));
        const specificText = element(by.cssContainingText(`div[id="pageContainer${pageNumber}"] div[class='textLayer'] > div`, text));

        BrowserVisibility.waitUntilElementIsVisible(allPages);
        BrowserVisibility.waitUntilElementIsVisible(pageLoaded);
        BrowserVisibility.waitUntilElementIsVisible(textLayerLoaded);
        BrowserVisibility.waitUntilElementIsVisible(specificText);
    }

    goToNextPage() {
        const nextPageIcon = element(by.css(`div[id='viewer-next-page-button']`));
        BrowserVisibility.waitUntilElementIsVisible(nextPageIcon);
        nextPageIcon.click();
    }

    goToPreviousPage() {
        const previousPageIcon = element(by.css(`div[id='viewer-previous-page-button']`));
        BrowserVisibility.waitUntilElementIsVisible(previousPageIcon);
        previousPageIcon.click();
    }

    goToPage(page) {
        const pageInput = element(by.css(`input[id='viewer-pagenumber-input']`));

        BrowserVisibility.waitUntilElementIsVisible(pageInput);
        pageInput.clear();
        pageInput.sendKeys(page);
        pageInput.sendKeys(protractor.Key.ENTER);
    }

    closePreviewWithButton() {
        BrowserVisibility.waitUntilElementIsVisible(this.closeButton);
        this.closeButton.click();
    }

    closePreviewWithEsc(fileName) {
        const filePreview = element.all(by.css(`div[class='canvasWrapper'] > canvas`)).first();

        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        BrowserVisibility.waitUntilElementIsVisible(element(by.cssContainingText(`div[data-automation-id="text_${fileName}"]`, fileName)));
        BrowserVisibility.waitUntilElementIsNotOnPage(filePreview);
    }

    clickDownload(fileName) {
        const downloadButton = element(by.css(`button[id='viewer-download-button']`));

        BrowserVisibility.waitUntilElementIsVisible(downloadButton);
        downloadButton.click();
    }

    clickZoomIn() {
        const zoomInButton = element(by.css(`div[id='viewer-zoom-in-button']`));

        BrowserVisibility.waitUntilElementIsVisible(zoomInButton);
        zoomInButton.click();
    }

    clickZoomOut() {
        const zoomOutButton = element(by.css(`div[id='viewer-zoom-out-button']`));

        BrowserVisibility.waitUntilElementIsVisible(zoomOutButton);
        zoomOutButton.click();
    }

    clickActualSize() {
        const actualSizeButton = element(by.css(`div[id='viewer-scale-page-button']`));

        BrowserVisibility.waitUntilElementIsVisible(actualSizeButton);
        actualSizeButton.click();
    }

    checkCanvasWidth() {
        return element.all(by.css(`div[class='canvasWrapper'] > canvas`)).first().getAttribute(`width`).then((width) => {
            return width;
        });
    }

    checkCanvasHeight() {
        return element.all(by.css(`div[class='canvasWrapper'] > canvas`)).first().getAttribute(`height`).then((height) => {
            return height;
        });
    }

    zoomIn() {
        const canvasLayer = element.all(by.css(`div[class='canvasWrapper'] > canvas`)).first();
        const textLayer = element(by.css(`div[id*='pageContainer'] div[class='textLayer'] > div`));

        BrowserVisibility.waitUntilElementIsVisible(canvasLayer);
        BrowserVisibility.waitUntilElementIsVisible(textLayer);

        let actualWidth,
            zoomedInWidth,
            actualHeight,
            zoomedInHeight;

        this.checkCanvasWidth().then((width) => {
            actualWidth = width;
            if (actualWidth && zoomedInWidth) {
                expect(zoomedInWidth).toBeGreaterThan(actualWidth);
            }
        });

        this.checkCanvasHeight().then( (height) => {
            actualHeight = height;
            if (actualHeight && zoomedInHeight) {
                expect(zoomedInHeight).toBeGreaterThan(actualHeight);
            }
        });

        this.clickZoomIn();

        this.checkCanvasWidth().then((width) => {
            zoomedInWidth = width;
            if (actualWidth && zoomedInWidth) {
                expect(zoomedInWidth).toBeGreaterThan(actualWidth);
            }
        });

        this.checkCanvasHeight().then( (height) => {
            zoomedInHeight = height;
            if (actualHeight && zoomedInHeight) {
                expect(zoomedInHeight).toBeGreaterThan(actualHeight);
            }
        });
    }

    actualSize() {
        const canvasLayer = element.all(by.css(`div[class='canvasWrapper'] > canvas`)).first();
        const textLayer = element(by.css(`div[id*='pageContainer'] div[class='textLayer'] > div`));

        BrowserVisibility.waitUntilElementIsVisible(canvasLayer);
        BrowserVisibility.waitUntilElementIsVisible(textLayer);

        let actualWidth,
            actualHeight,
            zoomedWidth,
            zoomedHeight,
            newWidth,
            newHeight;

        this.checkCanvasWidth().then((width) => {
            actualWidth = width;
        });

        this.checkCanvasHeight().then((height) => {
            actualHeight = height;
        });

        this.clickZoomIn();

        this.checkCanvasWidth().then((width) => {
            zoomedWidth = width;
        });

        this.checkCanvasHeight().then((height) => {
            zoomedHeight = height;
        });

        this.clickActualSize();

        this.checkCanvasWidth().then((width) => {
            newWidth = width;
            if (actualWidth && zoomedWidth && newWidth) {
                expect(newWidth).toBeLessThan(zoomedWidth);
                expect(newWidth).toEqual(actualWidth);
            }
        });

        this.checkCanvasHeight().then((height) => {
            newHeight = height;
            if (actualHeight && zoomedHeight && newHeight) {
                expect(newHeight).toBeLessThan(zoomedHeight);
                expect(newHeight).toEqual(actualHeight);
            }
        });
    }

    /*
    zoomOut() {
        const canvasLayer = element.all(by.css(`div[class='canvasWrapper'] > canvas`)).first();
        const textLayer = element(by.css(`div[id*='pageContainer'] div[class='textLayer'] > div`));

        BrowserVisibility.waitUntilElementIsVisible(canvasLayer);
        BrowserVisibility.waitUntilElementIsVisible(textLayer);

        let actualWidth;
        let zoomedOutWidth;
        let actualHeight;
        let zoomedOutHeight;

        this.checkCanvasWidth().then((width) => {
            actualWidth = width;
            if (actualWidth && zoomedOutWidth) {
                expect(zoomedOutWidth).toBeLessThan(actualWidth);
            }
        });

        this.checkCanvasHeight().then((height) =>  {
            actualHeight = height;
            if (actualHeight && zoomedOutHeight) {
                expect(zoomedOutHeight).toBeLessThan(actualHeight);
            }
        });

        this.clickZoomOut();

        this.checkCanvasWidth().then((width) => {
            zoomedOutWidth = width;
            if (actualWidth && zoomedOutWidth) {
                expect(zoomedOutWidth).toBeLessThan(actualWidth);
            }
        });

        this.checkCanvasHeight().then(() => {
            if (actualHeight && zoomedOutHeight) {
                expect(zoomedOutHeight).toBeLessThan(actualHeight);
            }
        });
    }
    */
}
