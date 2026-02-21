import "./App.css";

function addEntry() {
  return (
    <>
      <form action="" method="post" className="entry-form">
        <div className="entry-attribute">
          <label>Movie name: </label>
          <input type="text" name="title" id="title"></input>
        </div>
      </form>
    </>
  );
}

export default addEntry;
