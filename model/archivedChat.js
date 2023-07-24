const Sequelize= require('sequelize');
const sequelize= require('../util/database')

const archivedChat= sequelize.define('archivedChat',{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey:true,
        autoIncrement: true

    },
    message:{
        type: Sequelize.STRING,
        allowNull: false,
    }
})

module.exports=archivedChat;