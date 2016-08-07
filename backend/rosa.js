'use strict';
const JsonFn = require('json-fn');
const _ = require('lodash');
const path = require('path');
const PlanBuilder = require('./plan');
const q = require('q');
const moment = require('moment');

module.exports = (cms) => {

    const {mongoose, utils:{makeSelect, makeMultiSelect, makeTypeSelect, makeStyles, makeCustomSelect}} = cms;

    const Company = cms.registerSchema({
        name: {type: String, default: 'Name'}
    }, {
        name: 'Company',
        formatter: `
            <h4>{{model.name}}</h4>
        `,
        title: 'name',
        isViewElement: false
    });

    const Article = cms.registerSchema({
        title: {type: String},
        subtitle: String,
        text: {type: String, form: {type: 'textarea', templateOptions: {rows: 10}}},
        link: {
            text: String,
            url: String
        },
        picture1: {
            type: {
                alt: String,
                url: {type: String, form: {type: 'image'}}
            },
            nested: true,
            form: {
                hideExpression: function ($viewValue, $modelValue, scope) {
                    return scope.model.fromRight;
                }
            }
        },
        picture2: {
            type: {
                alt: String,
                url: {type: String, form: {type: 'image'}}
            },
            nested: true,
            form: {
                hideExpression: function ($viewValue, $modelValue, scope) {
                    return scope.model.fromRight;
                }
            }
        },
        picture: {
            type: [{
                alt: String,
                url: {type: String, form: {type: 'image'}}
            }],
            form: {
                type: 'repeatSection',
                hideExpression: function ($viewValue, $modelValue, scope) {
                    return !scope.model.fromRight;
                }
            }
        },
        fromRight: Boolean
    }, {
        name: 'Article',
        formatterUrl: 'backend/article.html',
        title: 'title',
        isViewElement: true,
        alwaysLoad: false,
        fn: {
            genSrcSet: picture => {
                const profiles = ['300x189', '768x485', '1024x647', '1200x758', '900x568', '400x253'];
                const res = _.reduce(profiles, function (result, resize) {
                    result += `,${picture.url}?resize=${resize} ${resize.split('x')[0]}w`;
                    return result;
                }, '');
                return res.substring(1);
            }
        }
    });

    const ArticleHeader = cms.registerSchema({
        title: {type: String},
        subtitle: String,
        picture: {
            alt: String,
            url: {type: String, form: {type: 'image'}}
        }
    }, {
        name: 'ArticleHeader',
        formatterUrl: 'backend/article-header.html',
        title: 'title',
        isViewElement: true,
        alwaysLoad: false
    });

    const MainArticleHeader = cms.registerSchema({
        title: {type: String},
        subtitle: String,
        text: {type: String, form: {type: 'textarea', templateOptions: {rows: 10}}},
        picture: {
            alt: String,
            url: {type: String, form: {type: 'image'}}
        },
        link: {
            url: String,
            text: String
        }
    }, {
        name: 'MainArticleHeader',
        formatterUrl: 'backend/main-article-header.html',
        title: 'title',
        isViewElement: true,
        alwaysLoad: false,
        info: {
            editorIcon: {
                top: '66px'
            }
        }
    });

    const Footer = cms.registerSchema({
        title: {type: String},
        text1: {type: String, form: {type: 'textarea', templateOptions: {rows: 10}}},
        text2: String,
        text3: String,
        copyright: {
            text1: String,
            text2: String,
            text3: String,
            link: String
        },
        link1: {
            text: String,
            url: String
        },
        link2: {
            text: String,
            url: String
        }
    }, {
        name: 'Footer',
        formatterUrl: 'backend/footer.html',
        title: 'title',
        isViewElement: true,
        alwaysLoad: false
    });

}