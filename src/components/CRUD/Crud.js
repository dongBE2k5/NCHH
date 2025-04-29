import Table from 'react-bootstrap/Table';
import { NavLink, Link,Outlet } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import TableUser from './TableUser';
import AddUser from './AddUser';
const Crud = (props) => {
    return (
        <Container >
            <AddUser/>
          <TableUser/>
          <Outlet/>
        </Container>


    )
}
export default Crud;