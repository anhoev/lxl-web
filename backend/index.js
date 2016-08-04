'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');
const cms = require('cmsmon');
cms.mongoose = mongoose;
cms.resolvePath = (p) => `backend/${p}`;
cms.data.security = false;
cms.listen(8888);
mongoose.connect('mongodb://localhost/rosa');

cms.use(require('cmsmon/mobile'));
cms.use(require('./organize'));

cms.server('backend/en', '');

cms.menu = {
    top:'51px',
    bodyPaddingTop: '0px'
}