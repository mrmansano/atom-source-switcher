'use babel';

import AtomSourceSwitcherView from './atom-source-switcher-view';
import { CompositeDisposable } from 'atom';
glob = require('glob');

export default {

  atomSourceSwitcherView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomSourceSwitcherView = new AtomSourceSwitcherView(state.atomSourceSwitcherViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomSourceSwitcherView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-source-switcher:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomSourceSwitcherView.destroy();
  },

  serialize() {
    return {
      atomSourceSwitcherViewState: this.atomSourceSwitcherView.serialize()
    };
  },

  toggle() {
    // Build the regex for header and source possible names
    patt_header = /[hH]([ppPP]?)/
    patt_source = /[cC]([ppPP]?)/
    // Get file
    file_path = atom.workspace.getActivePaneItem().getPath();
    split_filename = atom.workspace.getActivePaneItem().getFileName().split('.');
    base_name = split_filename[0];
    extension = split_filename[1];
    // Get project path
    project_path = atom.workspace.project.relativizePath(file_path)[0];
    // check if it is a header file
    if (patt_header.test(extension)) {
      project_path += "/**/" + base_name + ".?(c|C)*(p|P)";
    } else  if (patt_source.test(extension)) {
      project_path += "/**/" + base_name + ".?(h|H)*(p|P)";
    } else {
      return;
    }
    // Glob find the file
    candidate_files = glob.GlobSync(project_path);
    console.log(candidate_files);
    if (candidate_files.found.length > 0) {
      atom.workspace.open(candidate_files.found[0]);
    }
  }

};
