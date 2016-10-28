var cluster = require('cluster')

const log = require('loglevel')
log.setLevel('debug')

if (cluster.isMaster) {
  // var numCPUs = require('os').cpus().length

  for (var i = 0; i < 1; i++) {
    cluster.fork()
  }

  cluster.on('exit', function () {
    console.log('A worker process died, restarting...')
    cluster.fork()
  })
} else {
  var config = require('config')

  var express = require('express')
  var elasticsearch = require('elasticsearch')
  var pjson = require('./package.json')

  var app = express()

  app.thesaurus = config.thesaurus

  require('./lib/agents')(app)
  require('./lib/resources')(app)

  // routes
  require('./routes/agents')(app)
  require('./routes/resources')(app)

  require('./routes/misc')(app)

  app.esClient = new elasticsearch.Client({
    host: config['Elasticsearch'].host
  })

  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next()
  })

  app.get('/', function (req, res) {
    res.send(pjson.version)
  })

  app.listen(config['Port'], function () {
    console.log('Server started on port ' + config['Port'])
  })
}

