import slug from 'slug';
import fs from 'fs'
import message from './stuff.json' assert {type: 'json'};;


const arrayMessages = message.map((item) => {
    
     return   slug(item.toUpperCase(), {
            lower: false,
            replacement: "_",
          })
    
});


console.log(arrayMessages)

fs.writeFileSync('./messagesErrorSlugs.txt', arrayMessages.join('\n'));
