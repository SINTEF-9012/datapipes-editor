/*
 * Copyright 2015 Nicolas Ferry <${email}>
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
(function () {
    var bigml = joint.shapes.bigml;
    var mod = angular.module('bigmlEditor');

    /* Generic DataSource icon */
    bigml.DataSource = bigml.Component.extend({
        markup: '<g class="rotatable"><g class="scalable"><circle fill="#D74F27" cx="512" cy="512" r="512" class="body"/>' +
        '<path fill="#FFFFFF" d="M359.957,324.472h97.186v171.553c19.975,15.993,38.346,33.49,54.857,52.675c16.515-19.186,34.886-36.682,54.857-52.675V324.472h97.485c1.679-0.922,3.386-1.743,5.143-2.461L512,164.571L354.622,321.907C356.454,322.664,358.236,323.518,359.957,324.472z"/><path fill="#FFFFFF" d="M426.268,708.65c12.275-42.336,30.028-81.465,53.321-117.029c0.225-0.343,0.479-0.657,0.704-1c-41.525-51.25-97.382-91.143-166.464-117.792l21.3-103.571L146.286,493.714L270.7,682.586l20.632-100.343C354.061,610.136,399.089,652.436,426.268,708.65z"/><path fill="#FFFFFF" d="M688.871,369.257l21.301,103.571c-163.301,62.993-253.029,199.728-253.029,386.6h109.714c0-135.172,55.778-228.257,165.814-277.186L753.3,682.586l124.414-188.872L688.871,369.257z"/><image x="680" y="750" width="400" height="400"></image></g><g class="outPorts"/></g>',
        defaults: joint.util.deepSupplement({
            type: 'bigml.DataSource',
            size: {
                width: 120,
                height: 120
            },
            outPorts: ['out1'],
            attrs: {
                'path.front': {
                    fill: '#666'
                },
                '.label': {
                    text: 'Database',
                    'ref-y': -20
                }
            }
        }, bigml.Component.prototype.defaults),
        constructor: function () {
            bigml.Database.__super__.constructor.apply(this);
            this.properties = [
                {name: 'URL', type: 'url', default: 'localhost:8080'},
                {name: 'Authentication', type: 'string'},
                {name: 'Table', type: 'string'}
            ];
        }
    });

    bigml.DataSourceView = joint.shapes.devs.ModelView;

    /* Twitter REST Streaming API */
    bigml.twitterAPI = bigml.DataSource.extend({
        defaults: joint.util.deepSupplement({
            type: 'bigml.twitterAPI',
            attrs: {
                image: {
                    'xlink:href': 'assets/img/twitter.png'
                }
            }
        }, bigml.DataSource.prototype.defaults)
    });

    bigml.twitterAPIView = joint.shapes.devs.ModelView;


    /* Generic REST data source */
    bigml.RESTDataSource = bigml.DataSource.extend({
        defaults: joint.util.deepSupplement({
            type: 'bigml.twitterAPI',
            attrs: {
                image: {
                    'xlink:href': 'assets/img/rest.png'
                }
            }
        }, bigml.DataSource.prototype.defaults)
    });

    bigml.RESTDataSourceView = joint.shapes.devs.ModelView;


    /* Add to components list for GUI */
    mod.decorator('bigmlComponents', ['$delegate', function (components) {
        components.subgroups.push({
            text: 'Data sources',
            icon: '',
            elements: [
                {
                    text: 'Twitter API',
                    icon: 'assets/img/twitter.png',
                    jointEl: bigml.twitterAPI
                }, {
                    text: 'Generic REST',
                    icon: 'assets/img/rest.png',
                    jointEl: bigml.RESTDataSource
                }
            ]
        });
        return components;
    }]);

})();