import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api';

const useSignup = () => {
  const queryClient = useQueryClient(); // Use hook instead of direct instantiation

  const { mutate:signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    // refetch authUser query after successful signup
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });
  return {error , isPending , signupMutation}
}

export default useSignup