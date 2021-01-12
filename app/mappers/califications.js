const positionThreshold = [49, 29, 19, 9, 4];
const positions = ['CEO', 'HEAD', 'EM', 'TL', 'Lead', 'Developer'];

exports.getPosition = score => {
  const found = positionThreshold.findIndex(element => score > element);
  return found < 0 ? positions.slice(-1).pop() : positions[found];
};
