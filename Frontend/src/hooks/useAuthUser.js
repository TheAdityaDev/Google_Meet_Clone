import { useQuery } from '@tanstack/react-query';
import { AuthUser } from '../lib/api';

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: AuthUser,
    retry: false,
  });

  return {authUser:authUser.isLoading , authUserData:authUser?.data?.user}
}

export default useAuthUser