import { Command } from 'commander';
import { sendEvent } from '../eventService';
import { createCategoryEvent } from '../events/taxonomy/createCategoryEvent';
//import { createCatalogEvent } from '../events/createCatalogEvent';

const program = new Command();

program
  .name('send')
  .description('Send different event types')
  .argument('<type>', 'event type (category | catalog)')
  .action(async (type: string) => {
    try {
      let event;

      switch (type.toLowerCase()) {
        case 'create-category':
          event = createCategoryEvent();
          break;
       // case 'catalog':
          //event = createCatalogEvent();
          //break;
        default:
          console.error(`❌ Unknown event type: ${type}`);
          process.exit(1);
      }

      const result = await sendEvent(event);
      console.log(`✅ ${type} event sent successfully:\n`, result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('❌ General error:', err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: any } };
        console.error('❌ API error:', axiosError.response?.data || 'No response data');
      } else {
        console.error('❌ Unknown error:', err);
      }
    }
  });

program.parse();
