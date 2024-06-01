import { IMovie } from 'model/movie';
import { IMovieMessage } from '../core/interfaces/messages';
import { Message } from '../infrastructure';
import { movieService } from './movieServices';
export async function movieMessageHandler(
  message: Message<IMovieMessage>
): Promise<void> {
  await movieService.addMovie(message.body.data as IMovie);
}
