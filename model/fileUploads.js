const Sequelize= require('sequelize')
const sequelize = require('../util/database')

const fileUploads= sequelize.define('fileUploads',{
    id:{
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false,
    },
    fileURL:{
        type : Sequelize.STRING,
        allowNull: false
    }

})

module.exports= fileUploads;