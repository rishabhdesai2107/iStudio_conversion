<template>
  <div style="overflow:auto;">
    <q-card flat>
      <q-card-actions>
        <q-btn :style="`color: ${color}`" flat round icon="palette" >
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-color v-model="color" @input="$refs.editor.set('freeDrawing', { stroke: color })" />
          </q-popup-proxy>
        </q-btn>
        <q-btn
          :color=" currentAction === 'undo' ? 'primary' : '' " flat round icon="undo"
          @click="undo"
        />
        <q-btn
          :color=" currentAction === 'redo' ? 'primary' : '' " flat round icon="redo"
          @click="redo"
        />
        <q-btn
          :color=" currentAction === 'eraser' ? 'primary' : '' " flat round icon="auto_fix_high"
          @click="eraser"
        />
        <q-btn
          :color=" currentAction === 'clear' ? 'primary' : '' " flat round icon="delete_forever"
          @click="clear"
        />
        <q-btn
          :color=" currentAction === 'write' ? 'primary' : '' " flat round icon="edit"
          @click="write"
        />
        <q-btn
          :color=" currentAction === 'text' ? 'primary' : '' " flat round icon="title"
          @click="text"
        />
        <q-btn
          :color=" currentAction === 'circle' ? 'primary' : '' " flat round icon="radio_button_unchecked"
          @click="circle"
        />
        <q-btn
          :color=" currentAction === 'rect' ? 'primary' : '' " flat round icon="crop_square"
          @click="rect"
        />
        <q-btn
          :color=" currentAction === 'arrow' ? 'primary' : '' " flat round icon="south"
          @click="arrow"
        />
        <q-btn
          :color=" currentAction === 'selectMode' ? 'primary' : '' " flat round icon="open_with"
          @click="selectMode"
        />
        <q-btn
          :color=" currentAction === 'crop' ? 'primary' : '' " flat round icon="crop"
          @click="crop"
        />
        <q-btn flat round icon="upload_file" @click="$refs.file.click()" />
        <q-btn flat round icon="save" @click="save" />
      </q-card-actions>
      <input
        ref="file"
        type="file"
        @change="upload"
        style="display:none"
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
import Editor from 'vue-image-markup'

export default {
  props: {},
  components: {
    Editor
  },
  data() {
    return {
      imageUrl: `${process.env.API_BASE_URL}/images/iStudio/istudio mockup.jpg`,
      currentAction: '',
      editor: {},
      canvasId: 'studio-space',
      color: 'rgba(255,0,255,0.8)'
    }
  },
  mounted() {
    this.$refs.editor.setBackgroundImage(this.imageUrl)
    this.write()
  },
  methods: {
    undo() {
      this.$refs.editor.undo()
      this.currentAction = 'undo'
    },
    redo() {
      this.$refs.editor.redo()
      this.currentAction = 'redo'
    },
    clear() {
      this.$refs.editor.clear()
      this.currentAction = 'clear'
    },
    write() {
      this.$refs.editor.set('freeDrawing', { stroke: this.color, strokeWidth: 3 })
      this.currentAction = 'write'
    },
    text() {
      this.$refs.editor.set('text')
      this.currentAction = 'text'
    },
    circle() {
      this.$refs.editor.set('circle')
      this.currentAction = 'circle'
    },
    rect() {
      this.$refs.editor.set('rect')
      this.currentAction = 'rect'
    },
    arrow() {
      this.$refs.editor.set('arrow')
      this.currentAction = 'arrow'
    },
    selectMode() {
      this.$refs.editor.set('selectMode')
      this.currentAction = 'selectMode'
    },
    crop() {
      this.$refs.editor.set('crop')
      this.currentAction = 'crop'
    },
    eraser() {
      this.$refs.editor.set('eraser')
      this.currentAction = 'eraser'
    },
    upload(e) {
      this.$refs.editor.uploadImage(e)
    },
    save() {
      const base64 = this.$refs.editor.saveImage()
      console.log(base64)
    }
  }
};
</script>

