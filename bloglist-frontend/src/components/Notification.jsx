const Notification = ({ message }) => {
    if (message.msg === null) {
        return null
    }

    return (
        <div className={message.type}>
            {message.msg}
        </div>
    )
}

export default Notification