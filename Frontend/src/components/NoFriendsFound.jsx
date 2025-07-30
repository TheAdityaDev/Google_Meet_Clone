import { Link } from 'react-router'

const NoFriendsFound = () => {
  return (
    <div className='card bg-base-200 p-6 text-center'>
        <h3 className="font-semibold text-lg mb-2">Not yet friends.</h3>
        <p className="text-sm text-base-content/80 mb-4">
            You don't have any friends yet. Start adding friends to your list.
        </p>
        <Link to='/notification' className="btn btn-primary w-1/2 mx-auto">
            Add Friends
        </Link>
    </div>
  )
}

export default NoFriendsFound