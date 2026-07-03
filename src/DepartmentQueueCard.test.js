import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepartmentQueueCard from './DepartmentQueueCard';

describe('DepartmentQueueCard', () => {
    it('moves from initial check to lab review and enables medicines', async () => {
        const user = userEvent.setup();
        const { container } = render(<DepartmentQueueCard departmentName="General Medicine" initialToken="GEN-1" />);

        const testsSelect = container.querySelector('#tests-select');
        const medicinesSelect = container.querySelector('#medicines-select');

        await user.selectOptions(testsSelect, 'CBC');
        await user.click(screen.getByRole('button', { name: /submit tests/i }));

        expect(screen.getByText('Lab Review')).toBeTruthy();
        expect(medicinesSelect).toBeTruthy();
        expect(medicinesSelect.disabled).toBe(false);
    });
});
