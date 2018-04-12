import Mongoose from 'mongoose';
import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';
import fetch from 'node-fetch';

Mongoose.Promise = global.Promise;

const db = new Sequelize('blog', null, null, {
  dialect: 
  'sqlite',
  storage: './blog.sqlite',
});



const AuthorModel = db.define('author', {
  firstName: { type: Sequelize.STRING },
  lastName: { type: Sequelize.STRING },
});

const PostModel = db.define('post', {
  title: { type: Sequelize.STRING },
  text: { type: Sequelize.STRING },
});

AuthorModel.hasMany(PostModel);
PostModel.belongsTo(AuthorModel);

const OptionModel = db.define('option', {
  id: { type:Sequelize.BIGINT, primaryKey: true, autoIncrement: true},
  contract: { type: Sequelize.BIGINT },
  type: { type: Sequelize.STRING },
  period: { type: Sequelize.STRING },
  month: { type: Sequelize.BIGINT },
  week: { type: Sequelize.BIGINT },
  expiration: { type: Sequelize.DATE },
});


const mongo = Mongoose.connect('mongodb://localhost/views', {
  useMongoClient: true
});

const ViewSchema = Mongoose.Schema({
  postId: Number,
  views: Number,
});
const View = Mongoose.model('views', ViewSchema);

const FortuneCookie = {
  getOne() {
    return fetch('http://fortunecookieapi.herokuapp.com/v1/cookie')
      .then(res => res.json())
      .then(res => {
        return res[0].fortune.message;
      });
  },
};
// create mock data with a seed, so we always get the same
casual.seed(123);
db.sync({ force: true }).then(() => {
  _.times(10, () => {
    return AuthorModel.create({
      firstName: casual.first_name,
      lastName: casual.last_name,
    }).then((author) => {
      return author.createPost({
        title: `A post by ${author.firstName}`,
        text: casual.sentences(3),
      }).then((post) => { // <- the new part starts here
        // create some View mocks
        return View.update(
          { postId: post.id },
          { views: casual.integer(0, 100) },
          { upsert: true });
      });
    });
  });
}).then(() => 
  Option.create(
    {
      "contract": 1440,
      "expiration": new Date(2018, 4, 16),
      "period": "M",
      "type": "P"
    }
  )
).then(() => 
  Option.create(
  {
    "contract": 1440,
      "expiration": new Date(2018, 4, 16),
      "period": "M",
      "type": "C"
  }
));



const Author = db.models.author;
const Post = db.models.post;
const Option = db.models.option

export { Author, Post, View, FortuneCookie, Option};