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

import moment from 'moment-es6';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'adfTimeAgo'
})
export class TimeAgoPipe implements PipeTransform {

    defaultLocale = 'en-US';

    transform(value: Date, locale?: string) {
        if (value !== null && value !== undefined ) {
            const actualLocale = locale ? locale : this.defaultLocale;
            const then = moment(value);
            const diff = moment().locale(actualLocale).diff(then, 'days');
            return diff > 7 ? then.locale(actualLocale).format('DD/MM/YYYY HH:mm') : then.locale(actualLocale).fromNow();
        }
        return '';
    }
}
