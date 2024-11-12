class StateSave {
  /**
   * constructor
   * @param { Object } oldData 
   */
  constructor(oldData = {}) {
    this.items = oldData.items || {};
  }

  /**
   * add
   * @param { Array } item
   * @param { string } table
   * @return void
   */
  add(item, table) {
    const storedItem = { [table]: item };
    this.items[table] = this.items[table] || {};
    this.items = { ...this.items, ...storedItem };
  }
}

export default StateSave;
