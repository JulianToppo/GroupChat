const bodyParser = require('body-parser');
const express = require('express');
const sequelize = require('./util/database');
const signupRoutes = require('./router/signup')
const loginRoutes = require('./router/login')
const chatAppRouter = require('./router/chatapp')
//tables
const user = require('./model/user')
const messages = require('./model/messages')
const groups = require('./model/groups')
const usergroups = require('./model/user-groups')
const inviteRequests = require('./model/inviteRequest')
const fileUploads = require('./model/fileUploads')
const admin = require('./model/admin')
const archivedChat = require('./model/archivedChat')
const archiveChatsFn=require('./util/archiveChats')

const cron = require("node-cron");
const cors = require('cors')
const fs = require('fs');
const Axios = require('axios');
const morgan = require('morgan')
const path = require('path');
const fileUpload = require('express-fileupload');

const port = 3000;
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

var s;

io.on('connection', socket => {
    console.log(socket.id)
    s = socket;
})

Axios.default.baseURL = process.env.HOST_IPADDRESS;

app.use(cors({
    origin: '*',
    method: {}
}))

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),
    {
        flag: 'a'
    });

cron.schedule("0 0 * * *", function () {
    archiveChatsFn.archiveChats
});




app.use(morgan('combined', { stream: accessLogStream }))
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(function (req, res, next) {
    req.io = io;
    //  req.socket=s;
    next();
});

app.use(signupRoutes);
app.use(loginRoutes);
app.use(chatAppRouter);


//Sql table relations
user.hasMany(messages);
messages.belongsTo(user);

groups.hasMany(messages);
messages.belongsTo(groups);

user.belongsToMany(groups, { through: usergroups });
groups.belongsToMany(user, { through: usergroups });

user.hasMany(inviteRequests);
inviteRequests.belongsTo(user)

groups.hasMany(inviteRequests);
inviteRequests.belongsTo(groups)

groups.hasMany(admin)
admin.belongsTo(groups);

user.hasMany(admin)
admin.belongsTo(user);

user.hasMany(fileUploads);
fileUploads.belongsTo(user)


fileUploads.hasOne(messages)
messages.belongsTo(fileUploads);

//Archived chat
user.hasMany(archivedChat);
archivedChat.belongsTo(user);

groups.hasMany(archivedChat);
archivedChat.belongsTo(groups);

fileUploads.hasOne(archivedChat)
archivedChat.belongsTo(fileUploads);

sequelize.sync({}).then(result => {
    server.listen(port);
}).catch(err => {
    console.log(err);
})