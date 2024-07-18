const slugify = require('slugify');
const logger = require("../logger");
const { SLUGIFY } = require('../config/LOG_MSG');


function groupBy(array, key){
    return array.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  };
  
function generateSlug(title){
  
  logger.debug(SLUGIFY + ": " + title);

  return slugify(title,{
      lower: true,
      strict: true})

};
module.exports={
  groupBy,
  generateSlug
}  