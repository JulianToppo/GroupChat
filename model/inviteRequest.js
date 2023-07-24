const Sequelize= require('sequelize');
const sequelize= require('../util/database')

const InviteRequests= sequelize.define('inviteRequests',{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey:true,
        autoIncrement: true

    },
    status:{
        type:Sequelize.STRING,
        allowNull:false
    },
    invitationBy:{
        type:Sequelize.STRING,
        allowNull:false
    }
})

module.exports=InviteRequests;