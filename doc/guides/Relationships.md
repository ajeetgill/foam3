In FOAM, Relationships define typed links between models with automatic property/DAO generation and support for one-to-many and many-to-many cardinalities.

## How to define a Relationship

Use `foam.RELATIONSHIP({ ... })` with:
- `sourceModel` and `targetModel` (full model names)
- `cardinality`: `'1:*'` or `'*:*'`
- `forwardName` and `inverseName` (property names added to each model)
- Optional `sourceProperty`/`targetProperty` to configure UI/visibility
- Optional DAO keys (`sourceDAOKey`, `targetDAOKey`, `junctionDAOKey`)

## Cardinalities and junctions

- **1:\***: adds a collection property to the source and a reference property on the target. Example: User 1:\* Ticket adds `user.tickets` (DAO) and `ticket.owner` (Reference).
- **\*:\***: auto-generates a junction model with `sourceId`/`targetId` references and installs a ManyToManyRelationshipDAO that filters the target via the junction. Example: Group \*:\* Permission uses `groupPermissionJunctionDAO`.

## What gets installed

- On the source model: a property (often hidden) and a getter method returning a RelationshipDAO or ManyToManyRelationship.
- On the target model: a Reference property (often named by `inverseName`) that stores the source ID.
- For \*:\*: a junction class is registered if not already present.

## Example patterns

- One-to-many: Professor 1:\* Course adds `professor.courses` DAO and `course.professor` Reference.
- Many-to-many: Student \*:\* Course adds `student.courses` ManyToManyRelationship and `course.students` ManyToManyRelationship, with a StudentCourseJunction created automatically.

## Notes

- Relationships are axioms; they can be defined in any model file and are processed by `foam.RELATIONSHIP` which registers the Relationship and eagerly initializes the junction if needed.
- The `adaptTarget` factory automatically sets the inverse reference on target objects during relationship operations.
- Unauthorized DAO keys allow fallback DAOs for system/privileged contexts.