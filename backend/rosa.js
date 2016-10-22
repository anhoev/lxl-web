'use strict';
const JsonFn = require('json-fn');
const _ = require('lodash');
const path = require('path');
const q = require('q');
const moment = require('moment');
const traverse = require('traverse');
const nodemailer = require('nodemailer');

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
                top: '120px'
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

    const Nav = cms.registerSchema({
        title: {type: String},
        item: [{
            item: [{
                url: String,
                name: String,
            }],
            url: String,
            name: String,
        }],
        logo: {
            url: {type: String, form: {type: 'image'}},
            alt:String
        },
        logoDark: {
            url: {type: String, form: {type: 'image'}},
            alt:String
        }
    }, {
        name: 'Nav',
        formatterUrl: 'backend/nav.html',
        title: 'title',
        serverFn: {
            createNav: function*() {
                const result = traverse(cms.data.tree).map(function (node) {
                    if (_.isArray(this.node) && this.key === 'children') {
                        this.after(function () {
                            this.update(_.compact(this.node));
                        });
                    }

                    if (node && node.type) {
                        if (node.type !== 'containerDirectory') {
                            this.delete();
                        }
                    }
                });

                return result;
            }
        },
        info: {
            editorIcon: {
                top: '74px'
            }
        }
    });

    const Menu = cms.registerSchema({
        title: String,
        head1: String,
        head2: String,
        left: {
            element: [{
                choice: String,
                item: {
                    type: [{
                        highlight: String,
                        price: Number,
                        subTitle: String,
                        title: String,
                    }],
                    form: {type: 'tableSection'}
                },
                header: String
            }]
        },
        right: {
            element: [{
                choice: String,
                item: {
                    type: [{
                        highlight: String,
                        price: Number,
                        subTitle: String,
                        title: String,
                    }], form: {type: 'tableSection'}
                },
                header: String
            }]
        }
    }, {
        name: 'Menu',
        formatterUrl: 'backend/menu.html',
        title: 'title',
        isViewElement: true,
        alwaysLoad: false
    });

    const Reservation = cms.registerSchema({
        title: String
    }, {
        name: 'Reservation',
        formatterUrl: 'backend/reservation.html',
        title: 'title',
        isViewElement: true,
        alwaysLoad: false
    });

    cms.app.post('/api/reservation', function*({body:{partySize, phone, startDate, ResTime:time}}, res) {
        const {smtp, targetEmail} = JsonFn.parse(cms.readFile(path.resolve(__dirname, 'en/config.json')));
        var transporter = nodemailer.createTransport(`smtps://${smtp.user}%40gmail.com:${smtp.password}@smtp.gmail.com`);

        var mailOptions = {
            from: 'anhoev@gmail.com',
            to: targetEmail,
            subject: 'Reservierung',
            text: `
    Telephone: ${phone},
    Tag: ${startDate},
    Zeit: ${time},
    Anzahl: ${partySize}
`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.send('reserviert nicht erfolgreich: ' + error.message);
            }
            res.send('reserviert erfolgreich');
        });

    })
}