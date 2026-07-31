const fs = require('fs');
const path = require('path');

const basePath = "c:/Users/JAMES PERFECT/OneDrive/Desktop/xyz-main";
const toolsDir = path.join(basePath, "src/pages/tools");

if (fs.existsSync(toolsDir)) {
    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.astro'));
    for (const file of files) {
        const fullPath = path.join(toolsDir, file);
        let content = fs.readFileSync(fullPath, 'utf8');
        const match = content.match(/title=(['"])(.*?)\1/);
        if (match) {
            let oldTitle = match[2];
            if (oldTitle.includes('...')) {
                // Remove the ... and clean up trailing spaces/punctuation before | Seniors Audit
                let newTitle = oldTitle.replace(/\s*\.?\.?\.\s*\|\s*Seniors Audit$/, ' | Seniors Audit');
                newTitle = newTitle.replace(/[-—,]\s*\|\s*Seniors Audit$/, ' | Seniors Audit');
                
                // Let's ensure length is still <= 60
                let renderedLen = newTitle.includes('Seniors Audit') ? newTitle.length : newTitle.length + 16;
                if (renderedLen > 60) {
                    let base = newTitle.replace(/\s*\|\s*Seniors Audit$/, '');
                    base = base.substring(0, 44);
                    // trim to last word
                    base = base.replace(/\s+\S*$/, '');
                    base = base.replace(/[-—,]\s*$/, '');
                    newTitle = base + ' | Seniors Audit';
                }
                
                content = content.replace(/title=(['"])(.*?)\1/, `title="${newTitle}"`);
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed ... in ${file}: "${oldTitle}" -> "${newTitle}"`);
            }
        }
    }
}
