// Pre-typed react-redux hooks — always use these instead of the plain
// useDispatch/useSelector so RootState/AppDispatch flow through.

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
