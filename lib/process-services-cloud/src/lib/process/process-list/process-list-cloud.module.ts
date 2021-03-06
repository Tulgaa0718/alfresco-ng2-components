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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessListCloudComponent } from './components/process-list-cloud.component';
import { MaterialModule } from '../../material.module';
import { DataTableModule, TemplateModule, CoreModule } from '@alfresco/adf-core';
import { ProcessListCloudService } from './services/process-list-cloud.service';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        DataTableModule,
        TemplateModule,
        CoreModule

    ],
    declarations: [ProcessListCloudComponent],
    exports: [ProcessListCloudComponent],
    providers: [ProcessListCloudService]
})
export class ProcessListCloudModule { }
