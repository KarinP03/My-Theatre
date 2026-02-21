import "./App.css";

function addEntry() {
  return (
    <>
      <form action="" method="post" className="entry-form">
        <div className="entry-attribute">
          <label>Movie name: </label>
          <input type="text" name="title" id="title"></input>
        </div>
        <div className="entry-attribute">
          <label>Date acquired: </label>
          <input type="text" name="acquired" id="acquired"></input>
        </div>
        <div className="entry-attribute">
          <label>Format: </label>
          <input type="text" name="format" id="format"></input>
        </div>
        <div className="entry-attribute">
          <label>Audio quality: </label>
          <input type="text" name="audioQuality" id="audioQuality"></input>
        </div>
        <div className="entry-attribute">
          <label>Date last watched: </label>
          <input type="text" name="lastWatched" id="lastWatched"></input>
        </div>
        <div className="entry-attribute">
          <label>Rating: </label>
          <input type="text" name="rating" id="rating"></input>
        </div>
        <div className="entry-attribute">
          <label>Notes: </label>
          <input type="text" name="notes" id="notes"></input>
        </div>
      </form>
    </>
  );
}

export default addEntry;
