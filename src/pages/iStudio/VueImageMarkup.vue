<template>
    <div style="overflow: auto;">
      <q-card flat>
        <q-card-actions>
          <q-btn :style="`color: ${color}`" flat round icon="palette">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-color v-model="color" @input="setFreeDrawing" />
            </q-popup-proxy>
          </q-btn>
          <q-btn
            :color="currentAction === 'undo' ? 'primary' : ''" flat round icon="undo"
            @click="undo"
          />
          <q-btn
            :color="currentAction === 'redo' ? 'primary' : ''" flat round icon="redo"
            @click="redo"
          />
          <q-btn
            :color="currentAction === 'eraser' ? 'primary' : ''" flat round icon="auto_fix_high"
            @click="eraser"
          />
          <q-btn
            :color="currentAction === 'clear' ? 'primary' : ''" flat round icon="delete_forever"
            @click="clear"
          />
          <q-btn
            :color="currentAction === 'write' ? 'primary' : ''" flat round icon="edit"
            @click="write"
          />
          <q-btn
            :color="currentAction === 'text' ? 'primary' : ''" flat round icon="title"
            @click="text"
          />
          <q-btn
            :color="currentAction === 'circle' ? 'primary' : ''" flat round icon="radio_button_unchecked"
            @click="circle"
          />
          <q-btn
            :color="currentAction === 'rect' ? 'primary' : ''" flat round icon="crop_square"
            @click="rect"
          />
          <q-btn
            :color="currentAction === 'arrow' ? 'primary' : ''" flat round icon="south"
            @click="arrow"
          />
          <q-btn
            :color="currentAction === 'selectMode' ? 'primary' : ''" flat round icon="open_with"
            @click="selectMode"
          />
          <q-btn
            :color="currentAction === 'crop' ? 'primary' : ''" flat round icon="crop"
            @click="crop"
          />
          <q-btn flat round icon="upload_file" @click="triggerFileUpload" />
          <q-btn flat round icon="save" @click="save" />
        </q-card-actions>
        <input
          ref="fileInput"
          type="file"
          @change="upload"
          style="display: none"
        />
  
        <q-card-section>
          <q-card class="q-pa-md" flat bordered>
            <q-card-section>
              <Editor
                ref="editor"
                :canvasWidth="600"
                :canvasHeight="600"
                :editorId="canvasId"
              />
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import Editor from 'vue-image-markup';
  
  export default {
    components: {
      Editor
    },
    setup() {
      const editor = ref(null);
      const color = ref('rgba(255,0,255,0.8)');
      const currentAction = ref('');
      const canvasId = 'studio-space';
      const imageUrl = `${process.env.API_BASE_URL}/images/iStudio/istudio mockup.jpg`;
      const fileInput = ref(null);
  
      const setFreeDrawing = () => {
        if (editor.value) {
          editor.value.set('freeDrawing', { stroke: color.value });
        }
      };
  
      const undo = () => {
        editor.value.undo();
        currentAction.value = 'undo';
      };
  
      const redo = () => {
        editor.value.redo();
        currentAction.value = 'redo';
      };
  
      const clear = () => {
        editor.value.clear();
        currentAction.value = 'clear';
      };
  
      const write = () => {
        editor.value.set('freeDrawing', { stroke: color.value, strokeWidth: 3 });
        currentAction.value = 'write';
      };
  
      const text = () => {
        editor.value.set('text');
        currentAction.value = 'text';
      };
  
      const circle = () => {
        editor.value.set('circle');
        currentAction.value = 'circle';
      };
  
      const rect = () => {
        editor.value.set('rect');
        currentAction.value = 'rect';
      };
  
      const arrow = () => {
        editor.value.set('arrow');
        currentAction.value = 'arrow';
      };
  
      const selectMode = () => {
        editor.value.set('selectMode');
        currentAction.value = 'selectMode';
      };
  
      const crop = () => {
        editor.value.set('crop');
        currentAction.value = 'crop';
      };
  
      const eraser = () => {
        editor.value.set('eraser');
        currentAction.value = 'eraser';
      };
  
      const upload = (e) => {
        editor.value.uploadImage(e);
      };
  
      const save = () => {
        const base64 = editor.value.saveImage();
        console.log(base64);
      };
  
      const triggerFileUpload = () => {
        fileInput.value.click();
      };
  
      onMounted(() => {
        editor.value.setBackgroundImage(imageUrl);
        write();
      });
  
      return {
        editor,
        color,
        currentAction,
        canvasId,
        fileInput,
        setFreeDrawing,
        undo,
        redo,
        clear,
        write,
        text,
        circle,
        rect,
        arrow,
        selectMode,
        crop,
        eraser,
        upload,
        save,
        triggerFileUpload
      };
    }
  };
  </script>
  