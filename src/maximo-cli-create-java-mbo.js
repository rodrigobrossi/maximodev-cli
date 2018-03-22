#! /usr/bin/env node

var log = require('./lib/logger');
var env = require('./lib/env');
var cli = require('./lib/cli');
var mbo = require('./lib/mbos');
var dbcscripts = require('./lib/dbcscripts'); 

var lastScript = null;

try {
  lastScript = dbcscripts.lastScript();
} catch (e) {} // we might not be in an add-on dir, but we can still run scripts


var schema = {
  _version: '0.0.1',
  _description: 'Create a MBO structure for a new Maximo application/customization ',
  properties: {
    mbo_name: {
      description: "Mbo Name",
      pattern: /^[A-Z]+$/,
      message: 'Must only contain capital letters (i.e MYTABLE)',
      required: true,
      _cli: 'mbo_name',
      _prop: 'mbo_name',
      default: 'MYTABLE'
    },
    java_package: {
      description: "Default Java Package",
      pattern: /^[a-zA-Z_0-9.]+$/,
      message: 'Must only contain letters, numbers, underscores, or dots',
      required: true,
      _cli: 'java_package',
    },
    mbo_class_name: {
      description: "Mbo class name",
      pattern: /^[a-zA-Z0-9]+$/,
      message: 'Must follow Java conventions to define a Java class name (i.e MyTable)',
      required: true,
      _cli: 'mbo_class_name',
      _cli_arg_value: '<ClassName>',
      _prop: 'mbo_class_name',
      default: 'MyTable'
    },
    script: {
      required: true,
      description: 'DBC Script',
      _cli: 'script',
      default: lastScript,
      message: 'file does not exist'
    },
    service_name: {
      description: "What would be the service name?",
      _depends: 'add_service_support',
      message: 'It must contains capital letters only and should have no more then 18 characters',
      pattern: /^[A-Z]+$/,
      required: true,
      _cli: 'service_support',
      _prop: 'service_support',
      default: 'ASSET',
      conform: function(v) {
        if (v.length>18){ 
          return false;
        }
        return true;
      }
    },
    overwrite: {
      description: "overwrite existing files, if it exists?",
      required: true,
      _cli: 'overwrite',
      _yesno: 'n'
    }
  }//Ending properties.
};

cli.process(schema, process.argv, create_mbo);

function create_mbo(result) {
  
  var args = Object.assign({}, env.props, result);
  /**
   * Checks for dbc script to be generated.
   */
  if(env.bool(result.dbc_script)){
    log.info("Creating DBC files");
    mbo.installTemplateMbo("mbos/dbc", env.addonDir(), args);
  }

  /**
   * Add service support on create 
   */
  log.info("Setting up "+result.service_name+" service.");
  
  //Will create the new Mbo service 
  mbo.installTemplateMbo("mbos/service", env.addonDir(), args);
  
  //Will create the java files
  mbo.installTemplateMbo("mbos/java", env.addonDir(), args);
}

