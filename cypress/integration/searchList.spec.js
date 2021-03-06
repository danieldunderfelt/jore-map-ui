describe('Search list tests', () => {
    beforeEach(() => {
        cy.hslLoginWriteAccess();
    });
    it('Can open all routes from searchList', () => {
        cy.getTestElement('lineToggle').click();
        cy.getTestElement('lineSearch').clear();
        cy.getTestElement('openAllRoutesButton')
            .first()
            .click();
        cy.getTestElement('routeListView').should('exist');
    });

    it('Can open stop from searchList', () => {
        cy.getTestElement('nodeToggle').click();
        cy.getTestElement('lineSearch').click();
        cy.getTestElement('lineSearch')
            .clear()
            .type('110');

        cy.getTestElement('nodeItemP')
            .first()
            .click();
        cy.getTestElement('nodeView').should('exist');
    });
});
