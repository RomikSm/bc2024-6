const {program} = require('commander');
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');


const app = express();

program
    .requiredOption('-h, --host <address>', 'адреса сервера')
    .requiredOption('-p, --port <number>', 'порт сервера')
    .requiredOption('-c, --cache <path>', 'шлях до директорії, яка міститиме кешовані файли');

program.parse();

const options = program.opts();

app.use('/notes/:noteName', express.text());
app.use('/write', multer().none());

app.get('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Note not found');
    }

    const noteContent = fs.readFileSync(notePath, 'utf8');
    res.send(noteContent);
});

app.put('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Note not found');
    }

    fs.writeFileSync(notePath, req.body);
    res.status(200).send('Note updated successfully');

});

app.delete('/notes/:noteName', (req, res) => {
    const notePath = path.join(options.cache, `${req.params.noteName}.txt`);

    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Note not found');
    }
    fs.unlinkSync(notePath);
    res.status(200).send('Note deleted successfully');
});


app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(options.cache)
        .filter(file => file.endsWith('.txt'))
        .map(file => {
            const noteName = file.replace('.txt', '');
            const noteContent = fs.readFileSync(path.join(options.cache, file), 'utf8');
            return {name: noteName, text: noteContent};
        });
    res.status(200).json(notes);
});

app.post('/write', (req, res) => {
    const noteName = req.body.note_name;
    const note = req.body.note;
    const notePath = path.join(options.cache, `${noteName}.txt`);

    if (fs.existsSync(notePath)) {
        return res.status(400).send('Note already exists');
    }

    fs.writeFileSync(notePath, note);
    res.status(201).send('Note created successfully');
});

app.get('/UploadForm.html', (req, res) => {
    const formPath = path.join(options.cache, 'UploadForm.html');

    if (!fs.existsSync(formPath)) {
        return res.status(404).send('Not found');
    }

    const formContent = fs.readFileSync(formPath, 'utf8');
    res.status(200).send(formContent);
});

app.listen(options.port, options.host, () => {
    console.log(`Server started on http://${options.host}:${options.port}`);
});

