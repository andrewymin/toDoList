
// module.exports = getDate;

export const getDate = () => {

  var today = new Date();
  // var currentDay = today.getDay()
  // let week = ["sunday", "monday", "tuesday", 'wednsday', 'thursday', 'friday', 'saturday'];
  // let dayName = capitalizeFirstLetter(week[currentDay])

  let options = {
    weekday: 'long',
    day: "numeric",
    month: 'long',
  };

  options.timeZone = 'UTC';

  return today.toLocaleDateString("en-US", options);

};

export const getDay = () => {

  var today = new Date();

  let options = {
    weekday: 'long'
  };

  return today.toLocaleDateString("en-US", options);

};
