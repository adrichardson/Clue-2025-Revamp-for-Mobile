
export function updateSelectedImageColor(imageid) {
  const rootElement = document.documentElement;
  let hexcolor = '#333333';
  switch (imageid) {
    case 'misscarlet-thumb':
      hexcolor =  '#DF4531';
      break;
    case 'mrspeacock-thumb':
      hexcolor =  '#6CA5B9';
      break;      
    case 'mrswhite-thumb':
      hexcolor =  '#808080';
      break;      
    case 'mrgreen-thumb':
      hexcolor =  '#599B53';
      break;      
    case 'profplum-thumb':
      hexcolor =  '#8F5770';
      break;      
    case 'colmustard-thumb':
      hexcolor =  '#8C5723';
      break;
    default:
      break;
  }
  rootElement.style.setProperty('--selected-image', hexcolor); 
}

export function updateSelectedImageTag(imageid , tag) {
  let hexcolor = '#FFFFFF';
  switch (imageid) {
    case 'misscarlet-thumb':
      hexcolor =  '#DF4531';
      break;
    case 'mrspeacock-thumb':
      hexcolor =  '#6CA5B9';
      break;      
    case 'mrswhite-thumb':
      hexcolor =  '#808080';
      break;      
    case 'mrgreen-thumb':
      hexcolor =  '#599B53';
      break;      
    case 'profplum-thumb':
      hexcolor =  '#8F5770';
      break;      
    case 'colmustard-thumb':
      hexcolor =  '#8C5723';
      break;
    case 'remove':
      hexcolor =  'remove';
      break;
    default:
      hexcolor = '#A08960';
      break;
  }

  if(hexcolor != 'remove') {
    tag.style.backgroundColor = hexcolor;
  } else {
    tag.removeAttribute('style'); 
  }
}

export function getCharacterHexColorById(characterId) {
    let hexcolor;
    switch (characterId) {
      case 0:
        hexcolor =  '#DF4531';
        break;
      case 1:
        hexcolor =  '#6CA5B9';
        break;      
      case 2:
        hexcolor =  '#808080';
        break;      
      case 3:
        hexcolor =  '#599B53';
        break;      
      case 4:
        hexcolor =  '#8F5770';
        break;      
      case 5:
        hexcolor =  '#8C5723';
        break;
      default:
        hexcolor = '#333333';
        break;
    }
    return hexcolor;
}
