import { result } from "lodash";

async function readLocalFile() {
  return new Promise((resolve, reject) => {
    const uploadInput = document.createElement("input");

    uploadInput.addEventListener('change', _ => {
      //const file = uploadInput.files[0];
      /*resolve({
        type: file.type,
        name: file.name,
        file
      });*/
      let result = [];
      for( let file of uploadInput.files ) {
        result.push( {
          type: file.type,
          name: file.name,
          file
        } );
      }
      //const files = uploadInput.files.map( file => { return {type: file.type, name: file.name, file}; } );
      resolve( result );
      
    });

    // This input element in IE11 becomes visible after it is added on the page
    // Hide an input element
    uploadInput.style.visibility = 'hidden';

    uploadInput.type = "file";
    uploadInput.multiple = true
    document.body.appendChild(uploadInput);
    uploadInput.click();
    document.body.removeChild(uploadInput);
  });
}

export {
  readLocalFile
}
