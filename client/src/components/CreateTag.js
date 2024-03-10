export default function CreateTag(props) {
    return (
        <>
            <div>
                <button type="button" onClick={() => {
                    props.deleteTag(props.tag);
                }} className="btn btn-tag">
                    <p className="my-0">❌ {"#" + props.tag}</p>
                </button>
            </div>
        </>
    )
}



